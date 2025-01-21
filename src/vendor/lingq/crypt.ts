const LingqKey = async () => {
    return crypto.subtle.importKey(
        "raw",
        hex2buf(process.env.LINGQ_KEY!!),
        { name: "AES-CTR", length: 32 },
        true,
        ["encrypt", "decrypt"]
    );;
};


function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
    return Array.from(new Uint8Array(buffer))
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

function hex2buf(hex: string) {
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
}


export async function encryptLingqKey(key: string) {
    let lingq_token = null, counter = null
    counter = crypto.getRandomValues(new Uint8Array(16));
    const importLingqKey = await LingqKey();
    const encodeKey = new TextEncoder().encode(key)
    lingq_token = await crypto.subtle.encrypt(
        {
            name: "AES-CTR",
            counter: counter,
            length: 64
        },
        importLingqKey,
        encodeKey
    );
    lingq_token = buf2hex(lingq_token)
    counter = buf2hex(counter.buffer)
    return { lingq_token, lingq_counter: counter }
}

export async function decryptLingqKey(encodeKey:string,counter:string) {
    const decodeToken = hex2buf(encodeKey)
    const importLingqKey = await LingqKey();
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-CTR",
            counter: hex2buf(counter),
            length: 64,
        },
        importLingqKey,
        decodeToken
    )
    return new TextDecoder().decode(decrypted).toString()
}