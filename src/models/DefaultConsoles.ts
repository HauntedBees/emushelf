import { ConsoleInfo } from './Config';
function GetDefaultConsole(code: string, name: string, extensions: string[]): ConsoleInfo {
    return { shortCode: code, name: name, extensions: extensions, default: true, path: "", preferredEmulator: "", favorite: false, hideUnfavorited: false };
}
export const DefaultConsoles: {[key: string]: ConsoleInfo} = {
    // Nintendo
    "NES": GetDefaultConsole("NES", "Nintendo Entertainment System", [".nes", ".fds", ".nez", ".unf", ".unif"]),
    "SNES": GetDefaultConsole("SNES", "Super Nintendo Entertainment System", [".smc", ".sfc"]),
    "VB": GetDefaultConsole("VB", "Virtual Boy", [".vb"]),
    "N64": GetDefaultConsole("N64", "Nintendo 64", [".n64", ".z64", ".ndd", ".v64"]),
    "GCN": GetDefaultConsole("GCN", "Nintendo GameCube", [".nkit.iso", ".iso", ".gcm", ".gcz"]),
    "Wii": GetDefaultConsole("Wii", "Nintendo Wii", [".wbfs", ".wad"]),
    // -- Wii U
    "Switch": GetDefaultConsole("Switch", "Nintendo Switch", [".nsp", ".xci"]),
    "GB": GetDefaultConsole("GB", "Game Boy", [".gb"]),
    "GBC": GetDefaultConsole("GBC", "Game Boy Color", [".gbc"]),
    "GBA": GetDefaultConsole("GBA", "Game Boy Advance", [".gba", ".srl"]),
    "NDS": GetDefaultConsole("NDS", "Nintendo DS", [".nds", ".srl", ".dsi"]),
    "3DS": GetDefaultConsole("3DS", "Nintendo 3DS", [".3ds", ".app", ".cci", ".cia", ".csu", ".cxi"]),

    // Sega
    "SMS": GetDefaultConsole("SMS", "Sega Master System", [".sms"]),
    "MD": GetDefaultConsole("MD", "Sega Genesis/Mega Drive", [".md"]),
    "SCD": GetDefaultConsole("SCD", "Sega CD", [".bin", ".chd", ".cue", ".iso", ".m3u"]),
    "32x": GetDefaultConsole("32x", "Sega 32x", [".32x"]),
    "Sat": GetDefaultConsole("Sat", "Sega Saturn", [".cof", ".coff"]),
    "DC": GetDefaultConsole("DC", "Dreamcast", [".cdi", ".chd", ".gdi"]),
    "GG": GetDefaultConsole("GG", "Game Gear", [".gg"]),

    // Sony
    "PSX": GetDefaultConsole("PSX", "PlayStation", [".bin"]),
    "PS2": GetDefaultConsole("PS2", "PlayStation 2", [".bin"]),
    "PS3": GetDefaultConsole("PS3", "PlayStation 3", [".pkg", ".iso"]),
    "PS4": GetDefaultConsole("PS4", "PlayStation 4", [".disc"]),
    // -- PS5
    "PSP": GetDefaultConsole("PSP", "PlayStation Portable", [".cso", ".iso", ".pbp"]),
    "PSV": GetDefaultConsole("PSV", "PlayStation Vita", [".vpk"]),

    // Microsoft
    "XB": GetDefaultConsole("XB", "XBox", [".iso"]),
    "X360": GetDefaultConsole("X360", "XBox 360", [".iso"]),
    "XBO": GetDefaultConsole("XBO", "XBox One", [".iso"]),
    // -- Whatever the fuck the new one is called

    // Other
    "WS": GetDefaultConsole("WS", "WonderSwan", [".ws", ".wsc"]),
    "NGPC": GetDefaultConsole("NGPC", "Neo Geo Pocket (Color)", [".ngp", ".ngc"])
};