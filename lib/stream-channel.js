import {
  primitiveChannel 
} from './primitive'

import { 
  simpleReadStream, simpleWriteStream, simpleChannel 
} from './simple'

import { 
  promisedReadStream, promisedWriteStream, promisedChannel 
} from './promised'

export var createChannel = promisedChannel

export {
  primitiveChannel,
  simpleReadStream, simpleWriteStream, simpleChannel,
  promisedReadStream, promisedWriteStream, promisedChannel,
}