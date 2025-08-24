/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is dual-licensed:
 * - For non-commercial use: MIT License (see LICENSE-NC.txt)
 * - For commercial use: Requires a separate commercial license (contact author)
 *
 * You may not use this software for commercial purposes under the MIT License.
 */
 
#[tauri::command]
pub fn save_resource(resource_type: String, content: String, meta: String) -> Result<(), String> {
    let base_path = get_local_store_path(&resource_type)?;
    let content_path = base_path.join("content.json");
    let meta_path = base_path.join("meta.json");

    fs::write(content_path, content).map_err(|e| e.to_string())?;
    fs::write(meta_path, meta).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn load_resource(resource_type: String) -> Result<(String, String), String> {
    let base_path = get_local_store_path(&resource_type)?;
    let content = fs::read_to_string(base_path.join("content.json")).map_err(|e| e.to_string())?;
    let meta = fs::read_to_string(base_path.join("meta.json")).map_err(|e| e.to_string())?;

    Ok((content, meta))
}