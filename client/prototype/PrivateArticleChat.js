import { View } from "react-native";
import { MaybeArticleScreen, useArticle } from "../component/article"
import { InfoBox, Narrow, Pad } from "../component/basics";
import { Message, QuietSystemMessage } from "../component/message";
import { authorRobEnnals } from "../data/authors";
import { BottomScroller } from "../platform-specific/bottomscroller";
import { useCollection, useDatastore, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { ChatInput } from "../component/chatinput";
import { getGptConversationResponse } from "../component/chatgpt";
import { useState } from "react";

export const PrivateArticleChatPrototype = {
    key: 'privatechat',
    name: 'Private Article Chat',
    date: 'Tue Oct 19 2023 15:06:20 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'Chat with AI about an article. Publish messages you like.',
    screen: PrivateArticleChatScreen,
    instance: [
        {key: 'godzilla', name: 'Godzilla', articleKey: 'godzilla'},    
        {key: 'raw', name: 'No Article'}
    ]   
}

function PrivateArticleChatScreen(){
    return <MaybeArticleScreen articleChildLabel='Discuss with AI'>
        <Narrow>
            <Pad />
            <InfoBox titleLabel='Chat Privately and Publish Highlights' label='Messages will only be seen by others if you publish them.'/>
            <Pad />
            <PrivateChat />
        </Narrow>
    </MaybeArticleScreen>
}

function PrivateChat() {
    const personaKey = usePersonaKey();
    const messages = useCollection('message', {sortBy: 'time', filter: {withPerson: personaKey}});
    const datastore = useDatastore();
    const [inProgress, setInProgress] = useState(false);
    const articleKey = useGlobalProperty('articleKey');
    const article = useArticle(articleKey);

    console.log('messages', messages);
    console.log('article', article);

    async function onSend(text) {
        setInProgress(true);
        const message = {text: text, from: personaKey, withPerson: personaKey};
        datastore.addObject('message', message);
        const intro = {text: 'We are talking about this article: \n' + article.rawText, from: personaKey}
        const expandedMessages = [intro, ...messages, message]
        console.log('get response to messages', expandedMessages);
        const response = await getGptConversationResponse({datastore, messages: expandedMessages});
        datastore.addObject('message', {text: response, from: 'robo', withPerson: personaKey})
        setInProgress(false);
    }

    return <View>
        {messages.map(message => 
            <Message key={message.key} messageKey={message.key}/>
        )}
        {inProgress && <QuietSystemMessage label='AI chatbot is thinking...'/>}

        <ChatInput onSend={onSend} disabled={inProgress} />
    </View>
}