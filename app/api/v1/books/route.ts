// Copyright (c) 2025 Tsutomu FUNADA
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rakutenParams = ["title", "author", "isbn"];
  const rakutenEndpoints = ["BooksBook", "BooksForeignBook", "BooksMagazine"];

  const rakutenAppId = process.env.RAKUTEN_APP_ID;
  const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!rakutenAppId || !googleBooksApiKey) {
    return NextResponse.json(
      { error: "RAKUTEN_APP_ID or GOOGLE_BOOKS_API_KEY is missing" },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams();
    rakutenParams.forEach((param) => {
      const value = searchParams.get(param);
      if (value) params.append(param, value);
    });

    // 楽天APIからデータ取得
    const fetchRakutenPromises: Promise<Record<string, any>>[] =
      rakutenEndpoints.map(async (endpoint) => {
        try {
          const res = await fetch(
            `https://app.rakuten.co.jp/services/api/${endpoint}/Search/20170404?format=json&${params.toString()}&applicationId=${rakutenAppId}`
          );
          return res.ok
            ? await res.json()
            : { error: `Failed to fetch ${endpoint}` };
        } catch (error) {
          return {
            error: `Error fetching ${endpoint}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          };
        }
      });

    // Google Books APIからデータ取得
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      searchParams.get("title") || ""
    )}&key=${googleBooksApiKey}`;
    const fetchGooglePromise = fetch(googleBooksUrl)
      .then((res) =>
        res.ok ? res.json() : { error: "Failed to fetch Google Books" }
      )
      .catch((error) => ({
        error: `Error fetching Google Books: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }));

    // APIリクエストを並列実行
    const [rakutenResponses, googleData] = await Promise.all([
      Promise.all(fetchRakutenPromises),
      fetchGooglePromise,
    ]);

    // 楽天APIの統一フォーマット
    const unifiedBooks: Record<string, any> = {};
    rakutenResponses.forEach((response) => {
      if (response && response.Items) {
        response.Items.forEach((item: any) => {
          const isbn = item.Item.isbn || item.Item.title; // ISBNがない場合はタイトルで分類
          if (!unifiedBooks[isbn]) {
            unifiedBooks[isbn] = {
              title: item.Item.title,
              author: item.Item.author,
              publisher: item.Item.publisherName,
              publishedAt: item.Item.salesDate,
              description: item.Item.itemCaption,
              coverImageUrl: item.Item.mediumImageUrl,
              isbn: item.Item.isbn,
            };
          } else {
            // すでにある場合、補完可能な情報を追加
            unifiedBooks[isbn].publisher ||= item.Item.publisherName;
            unifiedBooks[isbn].publishedAt ||= item.Item.salesDate;
            unifiedBooks[isbn].description ||= item.Item.itemCaption;
            unifiedBooks[isbn].coverImageUrl ||= item.Item.largeImageUrl;
          }
        });
      }
    });

    // Google Books APIのデータを統合
    if (googleData.items) {
      googleData.items.forEach((item: any) => {
        const isbn =
          item.volumeInfo.industryIdentifiers?.find(
            (id: any) => id.type === "ISBN_13"
          )?.identifier || item.volumeInfo.title;
        if (!unifiedBooks[isbn]) {
          unifiedBooks[isbn] = {
            title: item.volumeInfo.title || "",
            author: item.volumeInfo.authors?.join(", ") || "",
            publisher: item.volumeInfo.publisher || "",
            publishedAt: item.volumeInfo.publishedDate || "",
            description: item.volumeInfo.description || "",
            coverImageUrl: item.volumeInfo.imageLinks?.thumbnail || "",
            isbn,
          };
        }
      });
    }

    return NextResponse.json(Object.values(unifiedBooks));
  } catch (error) {
    console.error("Error fetching book data:", error);
    return NextResponse.json(
      { error: "Failed to fetch book data" },
      { status: 500 }
    );
  }
}
