import { useDatastore } from "../util/datastore";
import { deepClone } from "../util/util";

const { useState, useEffect } = require("react");
const { callServerApiAsync } = require("../util/servercall");

var global_embedding_map = {};
var global_pending_map = {};

export async function getTextEmbedding({datastore, text}) {
    if (global_embedding_map[text]) {
        return global_embedding_map[text];
    } else {
        const embedding = await callServerApiAsync({datastore, component: 'chatgpt', funcname: 'embedding', params: {text}});
        global_embedding_map[text] = embedding;
        return embedding;
    }
}

export function useTextEmbedding(text) {
    const datastore = useDatastore();
    const [embedding, setEmbedding] = useState(null);

    async function updateEmbedding() {
        const embedding = await getTextEmbedding({datastore, text});
        setEmbedding(embedding);
    }

    useEffect(() => {
        updateEmbedding();
    }, [text])

    return embedding;
}

export function useMessageEmbeddingMap(messages) {
    const [embeddingMap, setEmbeddingMap] = useState({});
    const datastore = useDatastore();
    
    async function getMissingEmbeddings() {
        const missingTexts = [];

        messages.forEach(message => {
            if (!global_embedding_map[message.text] && !global_pending_map[message.text]) {
                missingTexts.push(message.text)
                global_pending_map[message.text] = true;
            }
        })

        if (missingTexts.length > 0) {
            const embeddingArray = await callServerApiAsync({
                datastore, component: 'chatgpt', funcname: 'embeddingArray', 
                params: {textArray: missingTexts}}
            );
            embeddingArray.forEach((embedding, i) => {
                global_embedding_map[missingTexts[i]] = embedding;
            })
        }

        const newEmbeddingMap = {};
        messages.forEach(message => {
            newEmbeddingMap[message.key] = global_embedding_map[message.text];
        })

        setEmbeddingMap(newEmbeddingMap);
    }

    useEffect(() => {
        console.log('useEffect', deepClone(messages));
        getMissingEmbeddings();
    }, [messages]);

    return embeddingMap;
}
