export const TYPE_WEB_APPLICATION = 'application' as const;
export const TYPE_DESKTOP_APPLICATION = 'desktop-application' as const;
export const TYPE_MINECRAFT_SERVER = 'minecraft-server' as const;

export type ApplicationType =
    | typeof TYPE_WEB_APPLICATION
    | typeof TYPE_DESKTOP_APPLICATION
    | typeof TYPE_MINECRAFT_SERVER;
