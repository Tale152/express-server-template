export default interface EncryptionHandler {

    encrypt: (str: string) => string

    compare: (comparingString: string, targetString: string) => boolean

}
