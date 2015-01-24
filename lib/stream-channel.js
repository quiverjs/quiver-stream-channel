export {
  primitiveChannel 
} from './primitive'

export { 
  simpleReadStream, simpleWriteStream, simpleChannel 
} from './simple'

export { 
  promisedReadStream, promisedWriteStream, promisedChannel 
} from './promised'

export let createChannel = promisedChannel