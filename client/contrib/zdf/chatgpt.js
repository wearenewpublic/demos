import { gptProcessAsync } from "../../component/chatgpt";

export async function askGptToEvaluateCommentsWithTopicAsync({datastore, promptKey, comments, topic}) {
    const response = await gptProcessAsync({datastore, promptKey, params: {comments, topic}});
    return response;
}

export async function askGptToRespondToCommentsWithTopicAsync({datastore, promptKey, comments, topic, analysis}) {
    const response = await gptProcessAsync({datastore, promptKey, params: {comments, topic, analysis}});
    return response;
}

export async function askGptToEvaluateHelpAcceptanceAsync({datastore, promptKey, comment, topic, help}) {
    const response = await gptProcessAsync({datastore, promptKey, params: {comment, topic, help}});
    return response?.judgement || false;
}