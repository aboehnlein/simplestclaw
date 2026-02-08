mod config;
pub mod runtime;
mod sidecar;

use runtime::RuntimeManager;
use sidecar::SidecarManager;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize managers
            app.manage(SidecarManager::default());
            app.manage(RuntimeManager::default());

            // Auto-install runtime in background if not installed
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if !RuntimeManager::is_installed() {
                    println!("[runtime] Node.js runtime not found, starting download...");
                    if let Some(manager) = app_handle.try_state::<RuntimeManager>() {
                        if let Err(e) = manager.install().await {
                            eprintln!("[runtime] Failed to install: {}", e);
                        }
                    }
                } else {
                    println!("[runtime] Node.js runtime already installed");
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Stop the gateway when the window is closed
            if let tauri::WindowEvent::Destroyed = event {
                if let Some(manager) = window.app_handle().try_state::<SidecarManager>() {
                    let _ = manager.stop();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            // Config
            config::get_config,
            config::set_api_key,
            config::has_api_key,
            // Gateway
            sidecar::start_gateway,
            sidecar::stop_gateway,
            sidecar::get_gateway_status,
            // Runtime
            runtime::get_runtime_status,
            runtime::install_runtime,
            runtime::is_runtime_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
