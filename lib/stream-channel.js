export {
  primitiveChannel 
} from './primitive'

export { 
  simpleReadStream, simpleWriteStream, simpleChannel 
} from './simple'

export { 
  promisedReadStream, promisedWriteStream, promisedChannel,
  promisedChannel as createChannel
} from './promised'
