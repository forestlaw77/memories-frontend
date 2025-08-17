/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { getCountryCenter } from "../maps/country_center_map";

const STATE_CENTER_MAP: { [key: string]: { [key: string]: [number, number] } } =
  {
    Australia: {
      "New South Wales": [-32, 147],
      Victoria: [-37, 144],
      Queensland: [-23, 143],
      "Western Australia": [-25, 121],
      "South Australia": [-30, 134],
    },

    China: {
      Guangdong: [23.379, 113.7633], // 广东
      Jiangsu: [32.9711, 119.4554], // 江苏
      Shandong: [36.6681, 118.0019], // 山东
      Zhejiang: [29.1832, 120.0934], // 浙江
      Henan: [33.8821, 113.614], // 河南
      Sichuan: [30.6595, 104.0657], // 四川
      Hubei: [30.9756, 112.2707], // 湖北
      Fujian: [26.0789, 119.3062], // 福建
      Hunan: [27.6104, 113.0823], // 湖南
      Anhui: [32.8822, 117.2827], // 安徽
      Hebei: [38.0428, 114.5149], // 河北
      Shaanxi: [34.3431, 108.9402], // 陕西
      Jiangxi: [27.614, 115.7221], // 江西
      Liaoning: [41.8057, 123.4291], // 辽宁
      Yunnan: [24.8801, 102.8329], // 云南
      Shanxi: [37.8734, 112.562], // 山西
      Guizhou: [26.8154, 106.8748], // 贵州
      Heilongjiang: [47.9219, 126.6425], // 黑龙江
      Jilin: [43.6664, 126.1922], // 吉林
      Gansu: [35.5692, 104.9903], // 甘肃
      Hainan: [20.0174, 110.3491], // 海南
      Qinghai: [35.7452, 95.9956], // 青海
      Guanxi: [23.8298, 108.3319], // 广西
      "Inner Mongolia": [43.535, 115.7321], // 内蒙古
      Ningxia: [38.4723, 106.2782], // 宁夏
      Xinjiang: [41.0934, 85.24], // 新疆
      Tibet: [30.5081, 91.1403], // 西藏
      Shanghai: [31.2304, 121.4737], // 上海
      Chongqing: [29.563, 106.5516], // 重庆
      Beijing: [39.9042, 116.4074], // 北京
      Tianjin: [39.3434, 117.3616], // 天津
      "Hong Kong": [22.3964, 114.1095], // 香港
      Macau: [22.1987, 113.5439], // 澳门
    },

    Japan: {
      Hokkaido: [43.0642, 141.3468],
      Aomori: [40.8246, 140.74],
      Iwate: [39.7036, 141.1527],
      Miyagi: [38.2688, 140.8721],
      Akita: [39.7186, 140.1024],
      Yamagata: [38.2404, 140.3633],
      Fukushima: [37.7503, 140.4677],
      Ibaraki: [36.3418, 140.4468],
      Tochigi: [36.5658, 139.8836],
      Gunma: [36.3911, 139.0608],
      Saitama: [35.8569, 139.6489],
      Chiba: [35.6046, 140.1233],
      Tokyo: [35.6895, 139.6917],
      Kanagawa: [35.4475, 139.6423],
      Niigata: [37.9022, 139.0236],
      Toyama: [36.6953, 137.2114],
      Ishikawa: [36.5946, 136.6256],
      Fukui: [36.0652, 136.2216],
      Yamanashi: [35.6641, 138.5683],
      Nagano: [36.6513, 138.1809],
      Gifu: [35.3912, 136.7222],
      Shizuoka: [34.9769, 138.383],
      Aichi: [35.1802, 136.9064],
      Mie: [34.7303, 136.5086],
      Shiga: [35.0045, 135.8686],
      Kyoto: [35.0212, 135.7556],
      Osaka: [34.6937, 135.5023],
      Hyogo: [34.6913, 135.183],
      Nara: [34.6851, 135.8327],
      Wakayama: [34.226, 135.1675],
      Tottori: [35.5033, 134.2382],
      Shimane: [35.4723, 133.0505],
      Okayama: [34.6618, 133.9344],
      Hiroshima: [34.3966, 132.4596],
      Yamaguchi: [34.1861, 131.4705],
      Tokushima: [34.0658, 134.5593],
      Kagawa: [34.3401, 134.0434],
      Ehime: [33.8416, 132.7657],
      Kochi: [33.5597, 133.5311],
      Fukuoka: [33.6066, 130.4183],
      Saga: [33.2494, 130.2988],
      Nagasaki: [32.7503, 129.8777],
      Kumamoto: [32.8031, 130.7079],
      Oita: [33.2382, 131.612],
      Miyazaki: [31.9111, 131.4239],
      Kagoshima: [31.5602, 130.558],
      Okinawa: [26.2124, 127.6809],
    },
    Taiwan: {
      "New Taipei": [25.0169, 121.4628],
      Taipei: [25.033, 121.5654],
      Kaohsiung: [22.6273, 120.3014],
      Taichung: [24.1477, 120.6736],
      Tainan: [22.9999, 120.227],
      Keelung: [25.1302, 121.7415],
      Hsinchu: [24.8138, 120.9685],
      Taoyuan: [24.9932, 121.2969],
      Changhua: [24.0904, 120.5375],
      Yunlin: [23.7104, 120.4223],
      "Pingtung County": [22.6722, 120.4875],
    },
    "New Zealand": {
      Auckland: [-36.8485, 174.7633],
      Wellington: [-41.2865, 174.7762],
      Christchurch: [-43.5321, 172.6362],
      Canterbury: [-43.5321, 172.6362],
      Hamilton: [-37.787, 175.2793],
      Tauranga: [-37.6861, 176.1651],
      Dunedin: [-45.8788, 170.5028],
      Otago: [-45.8788, 170.5028],
      "Central Otago District": [-45.8788, 170.5028],
      PalmerstonNorth: [-40.3523, 175.608],
      Napier: [-39.4928, 176.9126],
      Hastings: [-39.6422, 176.8439],
      "Queenstown-Lakes District": [-45.0311, 168.6626],
    },
    "South Korea": {
      Seoul: [37.5665, 126.978],
      Busan: [35.1796, 129.0756],
      Incheon: [37.4563, 126.7052],
      Daegu: [35.8714, 128.6014],
      Daejeon: [36.3504, 127.3845],
      Gwangju: [35.1595, 126.8526],
      Ulsan: [35.5384, 129.3114],
      Sejong: [36.4802, 127.2897],
    },

    "United States": {
      Alabama: [32.8065, -86.7911],
      Alaska: [61.3707, -152.4044],
      Arizona: [33.7298, -111.4312],
      Arkansas: [34.7465, -92.2896],
      California: [36.7783, -119.4179],
      Colorado: [39.5501, -105.7821],
      Connecticut: [41.6032, -73.0877],
      Delaware: [38.9108, -75.5277],
      Florida: [27.9944, -81.7603],
      Georgia: [32.1656, -82.9001],
      Hawaii: [19.8968, -155.5828],
      Idaho: [44.0682, -114.742],
      Illinois: [40.6331, -89.3985],
      Indiana: [39.7684, -86.1581],
      Iowa: [41.878, -93.0977],
      Kansas: [38.5266, -96.7265],
      Kentucky: [37.8393, -84.27],
      Louisiana: [30.9843, -91.9623],
      Maine: [45.2538, -69.4455],
      Maryland: [39.0458, -76.6413],
      Massachusetts: [42.4072, -71.3824],
      Michigan: [44.3148, -85.6024],
      Minnesota: [46.7296, -94.6859],
      Mississippi: [32.7416, -89.6787],
      Missouri: [37.9643, -91.8318],
      Montana: [46.8797, -110.3626],
      Nebraska: [41.4925, -99.9018],
      Nevada: [38.8026, -116.4194],
      "New Hampshire": [43.1939, -71.5724],
      "New Jersey": [40.0583, -74.4057],
      "New Mexico": [34.5199, -105.8701],
      "New York": [40.7128, -74.006],
      "North Carolina": [35.7596, -79.0193],
      "North Dakota": [47.5515, -101.002],
      Ohio: [40.4173, -82.9071],
      Oklahoma: [35.4676, -97.5164],
      Oregon: [43.8041, -120.5542],
      Pennsylvania: [41.2033, -77.1945],
      "Rhode Island": [41.5801, -71.4774],
      "South Carolina": [33.8361, -81.1637],
      "South Dakota": [43.9695, -99.9018],
      Tennessee: [35.5175, -86.5804],
      Texas: [31.9686, -99.9018],
      Utah: [39.32, -111.0937],
      Vermont: [44.5588, -72.5778],
      Virginia: [37.4316, -78.6569],
      Washington: [47.7511, -120.7401],
      "West Virginia": [38.5976, -80.4549],
      Wisconsin: [43.7844, -88.7879],
      Wyoming: [43.0759, -107.2903],
    },
    "United Kingdom": {
      England: [52.3555, -1.1743],
      Scotland: [56.4907, -4.2026],
      Wales: [52.6302, -3.958],
      NorthernIreland: [54.7877, -6.4923],
    },

    Vietnam: {
      Hanoi: [21.0285, 105.8542],
      "Hà Nội": [21.0285, 105.8542],
      HoChiMinh: [10.7769, 106.7009],
      "Ho Chi Minh City": [10.7769, 106.7009],
      DaNang: [16.0544, 108.2022],
      "Đà Nẵng": [16.0544, 108.2022],
      Hue: [16.4637, 107.5909],
      Haiphong: [20.8449, 106.6881],
      CanTho: [10.0452, 105.7469],
      "Bà Rịa - Vũng Tàu": [10.583, 107.25],
    },
  };

export function getStateCenter(
  country: string | null | undefined,
  state: string | null | undefined
): [number, number] | undefined {
  if (!country) {
    return [0, 0];
  } else if (!state) {
    return getCountryCenter(country);
  }
  return STATE_CENTER_MAP[country]?.[state] || getCountryCenter(country);
}
const CITY_CENTER_MAP: {
  [key: string]: { [key: string]: { [key: string]: [number, number] } };
} = {
  "United Kingdom": {
    England: {
      London: [51.5074, -0.1278], // ロンドンの中心座標
    },
  },
  France: {
    "Île-de-France": {
      Paris: [48.8566, 2.3522], // パリの中心座標
    },
  },
  Japan: {
    Tokyo: {
      Shinjuku: [35.6938, 139.7036],
      Shibuya: [35.6581, 139.7017],
      Chiyoda: [35.6938, 139.7536],
    },
    Osaka: {
      Kita: [34.7054, 135.4981],
      Namba: [34.6688, 135.5015],
    },
    Kyoto: {
      Gion: [35.0039, 135.7771],
    },
  },
  "United States": {
    California: {
      LosAngeles: [34.0522, -118.2437],
      SanFrancisco: [37.7749, -122.4194],
    },
    "New York": {
      Manhattan: [40.7831, -73.9712],
      Brooklyn: [40.6782, -73.9442],
    },
  },
};

export function getCityCenter(
  country: string | null | undefined,
  state: string | null | undefined,
  city: string | null | undefined
): [number, number] | undefined {
  if (!country) {
    return [0, 0];
  } else if (!state) {
    return getCountryCenter(country);
  } else if (!city) {
    return getStateCenter(country, state);
  }

  return (
    CITY_CENTER_MAP[country]?.[state]?.[city] || getStateCenter(country, state)
  );
}
