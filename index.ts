import { API } from './API'

export { API }

import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'
import { ForgeVersionsType, VersionJsonType } from '@ndml/types'
import { VersionAPIException } from './VersionAPIException'

export type VersionType = {
  id: string
  type: 'snapshot' | 'release'
  url: string
  time: string
  releaseTime: string
}

type VanillaVersionsResponseType = {
  latest: {
    release: string
    snapshot: string
  }
  versions: VersionType[]
}

type FabricVersionType = {
  version: string
  stable: boolean
}

type LoadersResponseType = {
  loader: {
    version: string
  }
}[]

export type AllVersions = {
  type: 'snapshot' | 'release'
  version: string
  fabric: boolean
  forge: boolean
}

export namespace MinecraftVersionAPI {
  export const fetchVanillaVersions = async (): Promise<VersionType[]> => {
    try {
      const {
        data: { versions },
      } = await axios.get<VanillaVersionsResponseType>(API.VANILLAVERSIONS)
      if (!versions) throw new VersionAPIException('Failed to fetch versions')
      return versions
    } catch (e: any) {
      throw new VersionAPIException(e.message)
    }
  }

  export const fetchFabricVersions = async (): Promise<string[]> => {
    try {
      const { data: versions } = await axios.get<FabricVersionType[]>(
        API.FABRICVERSIONS
      )
      if (!versions) throw new VersionAPIException('Failed to fetch versions')
      return versions.map(v => v.version)
    } catch (e: any) {
      throw new VersionAPIException(e.message)
    }
  }

  export const fetchVanillaVersionJson = async (
    version: string
  ): Promise<VersionJsonType> => {
    try {
      const rversion = (await MinecraftVersionAPI.fetchVanillaVersions()).find(
        v => v.id === version
      )
      if (!rversion)
        throw new VersionAPIException(`Failed to find ${version} version`)
      return axios.get(rversion.url).then(res => res.data)
    } catch (e: any) {
      throw new VersionAPIException(e.message)
    }
  }

  export const fetchLatestFabricLoader = async (
    version: string
  ): Promise<string> => {
    try {
      return await axios
        .get<LoadersResponseType>(
          API.FABRICLOADERS.replaceAll('%GAME_VERSION%', version)
        )
        .then(res => res.data[0].loader.version)
    } catch (e: any) {
      throw new VersionAPIException(e.message)
    }
  }

  export const fetchFabricJson = async (
    version: string
  ): Promise<VersionJsonType> => {
    try {
      const { data: vjson } = await axios.get<VersionJsonType>(
        API.FABRICJSON.replaceAll('%GAME_VERSION%', version).replaceAll(
          '%LOADER_VERSION%',
          await MinecraftVersionAPI.fetchLatestFabricLoader(version)
        )
      )
      if (!vjson) throw new VersionAPIException(`Failed to fetch fabric.json`)
      return vjson
    } catch (e: any) {
      throw new VersionAPIException(e.message)
    }
  }

  export const fetchForgeInstallerVersions = async (): Promise<
    Record<string, string[]>
  > => {
    try {
      const parsed: ForgeVersionsType = new XMLParser().parse(
        await axios
          .get<Buffer>(API.FORGEINSTALLERVERSIONS)
          .then(res => res.data)
      )
      let res: { [k: string]: string[] } = {}
      for (const v of parsed.metadata.versioning.versions.version) {
        const split = v.split('-')
        if (!res[split[0]]) res[split[0]] = [split[1]]
        else res[split[0]].push(split[1])
      }
      return res
    } catch (e: any) {
      throw new VersionAPIException(e.message)
    }
  }

  export const getLatestForgeInstallerVersion = async (gameVersion: string) => {
    return (await MinecraftVersionAPI.fetchForgeInstallerVersions())[
      gameVersion
    ][0]
  }

  export const getMinecraftForgeVersions = async () => {
    return Object.keys(await MinecraftVersionAPI.fetchForgeInstallerVersions())
  }

  export const fetchVersions = async (): Promise<AllVersions[]> => {
    const vanilla = await MinecraftVersionAPI.fetchVanillaVersions()
    const fabric = await MinecraftVersionAPI.fetchFabricVersions()
    const forge = await MinecraftVersionAPI.getMinecraftForgeVersions()
    return vanilla.map(v => ({
      type: v.type,
      version: v.id,
      fabric: fabric.includes(v.id),
      forge: forge.includes(v.id),
    }))
  }
}
