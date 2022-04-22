export enum API {
  VANILLAVERSIONS = 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
  RESOURCE = 'https://resources.download.minecraft.net',
  FABRICVERSIONS = 'https://meta.fabricmc.net/v2/versions/game',
  FABRICJSON = 'https://meta.fabricmc.net/v2/versions/loader/%GAME_VERSION%/%LOADER_VERSION%/profile/json',
  FABRICLOADERS = 'https://meta.fabricmc.net/v2/versions/loader/%GAME_VERSION%',
  FORGEINSTALLER = 'https://files.minecraftforge.net/maven/net/minecraftforge/forge/%FORGE_VERSION%/forge-%FORGE_VERSION%-installer.jar',
  FORGEINSTALLERVERSIONS = 'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml',
  FORGEMAVEN = 'https://maven.minecraftforge.net/',
  FORGELIBS = 'https://libraries.minecraft.net/',
}
