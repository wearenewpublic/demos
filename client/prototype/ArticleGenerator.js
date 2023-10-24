import { Text, View } from "react-native";
import { BodyText, Card, Center, HorizBox, Narrow, OneLineTextInput, Pad, PrimaryButton, ScreenTitleText, ScrollableScreen, Separator, SmallTitle, TimeText, WideScreen } from "../component/basics";
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
import { TabBar } from "../component/tabs";

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
    const [pitch, setPitch] = useState(null);
    const [key, setKey] = useState(null);
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
        const article = await gptProcessAsync({promptKey: 'article', model: 'gpt4', params: {pitch, model: 'gpt4'}});
        console.log('article', article);
        datastore.updateObject('article', key, {...article, inProgress: false});
        console.log('saved', key);
    }

    return <ScrollableScreen>
        <OneLineTextInput value={key || ''} onChange={setKey} placeholder='Article Key: Short strict (e.g. "godzilla") we can use to refer to this' />
        <Pad/>
        <OneLineTextInput value={pitch || ''} onChange={setPitch} placeholder='What is this article about?' />
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
    const french = useObject('article_french', article.key);
    const german = useObject('article_german', article.key);
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
            <Pad size={4}/>
            <HorizBox>
                <BodyText>English, </BodyText>
                {french && <BodyText>French, </BodyText>}
                {german && <BodyText>German</BodyText>}
            </HorizBox>
        </Card>
    }
}

function ArticleScreenTitle({articleKey}) {
    const article = useObject('article', articleKey);
    console.log('title', article?.title);
    return <ScreenTitleText title={article?.title ?? 'Article'}/>
}

function ArticleScreen({articleKey}) {
    const article_english = useObject('article', articleKey);
    const article_french = useObject('article_french', articleKey);
    const article_german = useObject('article_german', articleKey);
    const [language, setLanguage] = useState('english');
    const datastore = useDatastore();
    const [inProgress, setInProgress] = useState({});

    const langMap = {english: article_english, french: article_french, german: article_german};
    const article = langMap[language];

    async function onTranslate() {
        setInProgress({...inProgress, [language]: true});
        const translated_article = await gptProcessAsync({promptKey: 'article_translate', params: {
            articleJSON: JSON.stringify(article_english, null, 4), targetLanguage: language}});
        console.log('translated_article', translated_article);
        datastore.addObjectWithKey('article_' + language, articleKey, translated_article);
        setInProgress({...inProgress, [language]: false});
    }

    console.log('article', article);

    const langInProgress = inProgress[language];

    return <ScrollableScreen maxWidth={800}>
        <TabBar 
            tabs={[{label: 'English', key: 'english'}, {label: 'German', key: 'german'}, {label: 'French', key: 'french'}]} 
            selectedTab={language} onSelectTab={setLanguage} />
        <Pad size={32} />
        {article && <Article article={article} />}
        {!article && !langInProgress && <Center><PrimaryButton label='Translate Article' onPress={onTranslate} /></Center>}
        {!article && langInProgress && <QuietSystemMessage label='Translating...' />}
    </ScrollableScreen>
}


