import { primitiveChannel } from './primitive.js'
import { simpleReadStream, simpleWriteStream, simpleChannel } from './simple.js'
import { promisedReadStream, promisedWriteStream, promisedChannel } from './promised.js'

export var createChannel = promisedChannel

export {
  primitiveChannel,
  simpleReadStream, simpleWriteStream, simpleChannel,
  promisedReadStream, promisedWriteStream, promisedChannel,
}