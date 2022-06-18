export default interface EncryptionHandler {

    encrypt: (str: string) => Promise<string>

    compare: (comparingString: string, targetString: string) => Promise<boolean>

}
