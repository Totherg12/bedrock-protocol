const mcData = require('minecraft-data')

// Minimum supported version (< will be kicked)
const MIN_VERSION = '1.16.201'

// Versão real dos dados internos disponíveis no minecraft-data
const CURRENT_VERSION = '1.26.45'

// Versão experimental do servidor
const EXPERIMENTAL_VERSION = '1.26.51'

// ID do protocolo Bedrock 1.26.51
const EXPERIMENTAL_PROTOCOL_VERSION = 2193

const Versions = Object.fromEntries(
  mcData.versions.bedrock
    .filter(e => e.releaseType === 'release')
    .map(e => [e.minecraftVersion, e.version])
)

// Skip some low priority versions on GitHub Actions
const skippedVersionsOnGithubCI = [
  '1.16.210',
  '1.17.10',
  '1.17.30',
  '1.18.11',
  '1.19.10',
  '1.19.20',
  '1.19.30',
  '1.19.40',
  '1.19.50',
  '1.19.60',
  '1.19.63',
  '1.19.70',
  '1.20.10',
  '1.20.15',
  '1.20.30',
  '1.20.40',
  '1.20.50',
  '1.20.61',
  '1.20.71',
  '1.21.2',
  '1.21.20',
  '1.21.30',
  '1.21.42',
  '1.21.50',
  '1.21.60',
  '1.21.70',
  '1.21.80',
  '1.21.90',
  '1.21.93',
  '1.21.100',
  '1.21.111',
  '1.21.120',
  '1.21.124',
  '1.26.10',
  '1.26.20'
]

const testedVersions = process.env.CI
  ? Object.keys(Versions).filter(
      version => !skippedVersionsOnGithubCI.includes(version)
    )
  : Object.keys(Versions)

const defaultOptions = {
  version: CURRENT_VERSION,

  autoInitPlayer: true,

  offline: false,

  connectTimeout: 9000,

  raknetBackend: 'raknet-native',

  useRaknetWorkers: true,

  compressionAlgorithm: 'deflate',

  compressionLevel: 7,

  compressionThreshold: 512
}

function validateOptions (options) {
  /*
   * Suporte experimental para 1.26.51.
   *
   * A biblioteca usa os dados internos da 1.26.45,
   * mas envia o número de protocolo da 1.26.51.
   */
  if (options.version === EXPERIMENTAL_VERSION) {
    console.warn(
      '[bedrock-protocol] Usando suporte experimental para Minecraft 1.26.51'
    )

    // Faz serializer/deserializer usarem os dados conhecidos da 1.26.45
    options.version = CURRENT_VERSION

    // Envia o protocolo da 1.26.51 ao servidor
    options.protocolVersion = EXPERIMENTAL_PROTOCOL_VERSION

    if (options.useNativeRaknet === true) {
      options.raknetBackend = 'raknet-native'
    }

    if (options.useNativeRaknet === false) {
      options.raknetBackend = 'jsp-raknet'
    }

    return
  }

  if (!Versions[options.version]) {
    console.warn('Supported versions', Versions)
    throw Error(`Unsupported version ${options.version}`)
  }

  options.protocolVersion = Versions[options.version]

  if (options.protocolVersion < MIN_VERSION) {
    throw new Error(
      `Protocol version < ${MIN_VERSION}: ${options.protocolVersion}, too old`
    )
  }

  if (options.useNativeRaknet === true) {
    options.raknetBackend = 'raknet-native'
  }

  if (options.useNativeRaknet === false) {
    options.raknetBackend = 'jsp-raknet'
  }
}

module.exports = {
  defaultOptions,
  MIN_VERSION,
  CURRENT_VERSION,
  Versions,
  validateOptions,
  testedVersions
}
