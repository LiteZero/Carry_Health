#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "linux")]
pub use linux::*;
#[cfg(target_os = "macos")]
pub use macos::*;
#[cfg(target_os = "windows")]
pub use windows::*;

#[cfg(any(target_os = "macos", target_os = "windows"))]
pub fn is_frontapp_in_whitelist(whitelist_apps: &Vec<String>) -> bool {
    check_whitelist(whitelist_apps)
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub fn is_frontapp_in_whitelist(_whitelist_apps: &Vec<String>) -> bool {
    false
}

#[cfg(target_os = "macos")]
pub async fn get_installed_apps(_app_handle: &tauri::AppHandle) -> Vec<String> {
    get_local_installed_apps().await
}

#[cfg(target_os = "windows")]
pub async fn get_installed_apps(app_handle: &tauri::AppHandle) -> Vec<String> {
    get_local_installed_apps(app_handle)
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub async fn get_installed_apps(_app_handle: &tauri::AppHandle) -> Vec<String> {
    vec![]
}
