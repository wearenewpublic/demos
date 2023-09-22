import { Text, View } from "react-native";
import { BodyText, Card, HorizBox, Narrow, OneLineTextInput, Pad, PrimaryButton, ScreenTitleText, ScrollableScreen, Separator, SmallTitle, TimeText, WideScreen } from "../component/basics";
import { authorRobEnnals } from "../data/authors";
import { PrototypeContext } from "../organizer/PrototypeContext";
import { Datastore, useCollection, useDatastore, useGlobalProperty, useObject } from "../util/datastore";
import { pushSubscreen } from "../util/navigate";
import { useState } from "react";
import { callServerApiAsync } from "../util/servercall";
import { gptProcessAsync } from "../component/chatgpt";
import { Article, MaybeArticleScreen } from "../component/article";
import { QuietSystemMessage } from "../component/message";
import { BasicComments } from "../component/comment";
import { UserFace } from "../component/userface";

export const ArticleGenerator = {
    key: 'articlegen',
    name: 'Article Generator',
    date: 'Mon Sep 21 2023',
    author: authorRobEnnals,
    description: 'Generate Articles for use in other demos',
    screen: ArticleGeneratorScreen,
    subscreens: {
        article: {screen: ArticleScreen, title: ArticleScreenTitle},
    },
    instance: [
        {
            key: 'articles', name: 'Article Generator', isLive: true
        }
    ],
}

function ArticleGeneratorScreen() {
    const articles = useCollection('article', {sortBy: 'time', reverse: true});
    const name = useGlobalProperty('name');
    const datastore = useDatastore();
    const [pitch, setPitch] = useState('');
    const [key, setKey] = useState('');
    const existingArticle = useObject('article', key);

    console.log('articles', articles);
    console.log('datastore', datastore);
    console.log('name', name);
    console.log('datastore props',datastore.props);
    console.log('data', datastore.getData());
    

    async function onGenerate() {
        datastore.addObjectWithKey('article', key, {pitch, inProgress: true});
        setPitch('');
        setKey('');
        const article = await gptProcessAsync({promptKey: 'article', params: {pitch, model: 'gpt4'}});
        console.log('article', article);
        datastore.updateObject('article', key, {...article, inProgress: false});
        console.log('saved', key);
    }

    return <ScrollableScreen>
        <OneLineTextInput value={key} onChange={setKey} placeholder='Article Key: Short strict (e.g. "godzilla") we can use to refer to this' />
        <Pad/>
        <OneLineTextInput value={pitch} onChange={setPitch} placeholder='What is this article about?' />
        <Pad/>

        {!existingArticle && key && pitch && <PrimaryButton label='Generate Article' onPress={onGenerate} />}
        {key && existingArticle && <QuietSystemMessage label='Article with this key already exists' />}
        <Separator />
        <View>
            {articles.map(article => <ArticlePreview key={article.key} article={article} />)}
        </View>
    </ScrollableScreen>
}

function ArticlePreview({article}) {
    const creator = useObject('persona', article.from);
    if (article.inProgress) {
        return <Card onPress={() => pushSubscreen('article', {articleKey: article.key})}>
            <SmallTitle>In Progress: {article.pitch}</SmallTitle>
        </Card>
    } else {
        return <Card onPress={() => pushSubscreen('article', {articleKey: article.key})}>
            <SmallTitle>{article.title}</SmallTitle>            
            <Pad size={4}/>
            <HorizBox center>
                <UserFace userId={article.from} size={16} />
                <Pad size={4} />
                <Text style={{fontSize: 14, color: '#222'}}>{creator.name}</Text>
                <Pad /><TimeText time={article.time} />
            </HorizBox>
            <Pad size={4}/>
            <BodyText>key: {article.key}</BodyText>
        </Card>
    }
}

function ArticleScreenTitle({articleKey}) {
    const article = useObject('article', articleKey);
    console.log('title', article?.title);
    return <ScreenTitleText title={article?.title ?? 'Article'}/>
}

function ArticleScreen({articleKey}) {
    const article = useObject('article', articleKey);
    return <MaybeArticleScreen article={article} articleChildLabel='Conversation'><Narrow><BasicComments /></Narrow></MaybeArticleScreen>
}

