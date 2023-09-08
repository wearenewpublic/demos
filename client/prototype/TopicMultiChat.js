import { Image, View } from "react-native";
import { MaybeArticleScreen } from "../component/article";
import { BigTitle, BodyText, Card, Center, Clickable, EditableText, HorizBox, ListItem, MaybeEditableText, Narrow, Pad, PadBox, PreviewText, ScrollableScreen, SectionBox, SectionTitleLabel, SmallTitle, SmallTitleLabel } from "../component/basics";
import { godzilla_article } from "../data/articles/godzilla";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { expandDataList, expandUrl } from "../util/util";
import { pushSubscreen } from "../util/navigate";
import { TopCommentInput } from "../component/replyinput";
import { BasicComments, CommentContext, GuestAuthorBling } from "../component/comment";
import { useContext } from "react";
import { QuietSystemMessage } from "../component/message";
import { languageFrench, useTranslation } from "../component/translation";
import { godzilla_article_french } from "../translations/french/articles_french";

export const TopicMultiChatPrototype = {
    key: 'topicmulti',
    name: 'Topic Multi-Chat Prototype',
    description: "Multiple organizations can have a stance on the article's topic. People can then use inner/outer conversations to engage with the organization.",
    author: authorRobEnnals,
    date: '2023-08-30',
    hasMembers: true,
    screen: TopicStanceScreen,
    subscreens: {
        stance: {screen: StanceScreen, title: 'Topic Stance'},
        topic: {screen: TopicScreen, title: 'Topic'}
    },
    instance: [
        {key: 'godzilla-article', name: 'Godzilla Article', article: godzilla_article,
            topic: expandDataList([
                {key: 'monster', title: 'Giant Monster Attacks'},
                {key: 'attack', title: 'Aug 2023 Godzilla Attack on New York'},
                {key: 'safe', title: 'NYC Disaster Preparedness'},               
            ]), 
            stance: expandDataList([
                {key: 'monster-pro', topic: 'monster', org: 'Monster Protection Society', 
                    text: "Giant monster attacks are the fault of humans, not monsters. We need to stop polluting the oceans and stop building nuclear power plants.",
                },
                {key: 'monster-sci', topic: 'monster', org: 'Institute of Important Scientists',
                    text: 'Monster attacks have increased by 50% in the last 10 years. We need to study the monsters to understand why they are attacking us.',
                },
                {key: 'nyc-mayor', topic: 'attack', org: "New York City Mayor's Office",
                    text: 'We need to evacuate New York City and move everyone to New Jersey. Once New York is evacuted, we can bring in the national guard and use heavy weapons against the monster',
                },
                {key: 'nyc-safe', topic: 'safe', org: 'New York Citizens Association',
                    text: 'New York City currently spends 1% of its budget on disaster preparedness. We need to increase that to 2%, to be in line with other major cities with similar risks.',
                }
            ]),
        },
        {key: 'godzilla-article-french', name: 'Godzilla Article (French)', article: godzilla_article_french, language: languageFrench,
        topic: expandDataList([
            {key: 'monster', title: 'Attaques de Monstres Géants'},
            {key: 'attack', title: 'Attaque de Godzilla en août 2023 à New York'},
            {key: 'safe', title: 'Préparation aux Catastrophes à NYC'},                   
        ]), 
        stance: expandDataList([
            {key: 'monster-pro', topic: 'monster', org: 'Société de Protection des Monstres',
                text: 'Les attaques de monstres géants sont la faute des humains, pas des monstres. Nous devons arrêter de polluer les océans et arrêter de construire des centrales nucléaires.',
            },
            {key: 'monster-sci', topic: 'monster', org: 'Institut des Scientifiques Importants',
                text: 'Les attaques de monstres ont augmenté de 50% au cours des 10 dernières années. Nous devons étudier les monstres pour comprendre pourquoi ils nous attaquent.',
            },
            {key: 'nyc-mayor', topic: 'attack', org: 'Bureau du Maire de New York',
                text: 'Nous devons évacuer New York et déplacer tout le monde au New Jersey. Une fois New York évacuée, nous pouvons faire appel à la garde nationale et utiliser des armes lourdes contre le monstre',
            },
            {key: 'nyc-safe', topic: 'safe', org: 'Association des Citoyens de New York',
                text: "New York City consacre actuellement 1% de son budget à la préparation aux catastrophes. Nous devons augmenter cela à 2%, pour être en accord avec d'autres grandes villes ayant des risques similaires.",
            }
        ]),
    },

        {key: 'godzilla', name: 'Godzilla Raw', title: 'Godzilla Attacks New York',
        topic: expandDataList([
            {key: 'monster', title: 'Giant Monster Attacks'},
            {key: 'attack', title: 'Aug 2023 Godzilla Attack on New York'},
            {key: 'safe', title: 'NYC Disaster Preparedness'},               
        ]), 
        stance: expandDataList([
            {key: 'monster-pro', topic: 'monster', org: 'Monster Protection Society', 
                text: "Giant monster attacks are the fault of humans, not monsters. We need to stop polluting the oceans and stop building nuclear power plants.",
            },
            {key: 'monster-sci', topic: 'monster', org: 'Institute of Important Scientists',
                text: 'Monster attacks have increased by 50% in the last 10 years. We need to study the monsters to understand why they are attacking us.',
            },
            {key: 'nyc-mayor', topic: 'attack', org: "New York City Mayor's Office",
                text: 'We need to evacuate New York City and move everyone to New Jersey. Once New York is evacuted, we can bring in the national guard and use heavy weapons against the monster',
            },
            {key: 'nyc-safe', topic: 'safe', org: 'New York Citizens Association',
                text: 'New York City currently spends 1% of its budget on disaster preparedness. We need to increase that to 2%, to be in line with other major cities with similar risks.',
            }
        ]),
    },
    ]
}

function TopicStanceScreen() {
    const topics = useCollection('topic', {sortBy: 'title'});
    return <MaybeArticleScreen articleChildLabel='Community Stances' embed={<TopicListEmbed/>}>
        <Narrow>
            {topics.map(topic =>
                <PadBox key={topic.key} vert={16}>
                    <SectionBox>
                        <Center><SmallTitle>{topic.title}</SmallTitle></Center>
                        <TopicStances topic={topic} />
                    </SectionBox>
                </PadBox>
            )}
        </Narrow>
    </MaybeArticleScreen>
}

function TopicScreen({topicKey}) {
    const topic = useObject('topic', topicKey);
    const article = useGlobalProperty('article');
    return <ScrollableScreen>
        <BigTitle>{topic.title}</BigTitle>
        <Pad size={16}/>
        <SmallTitleLabel label='Stances'/>
        <TopicStances topic={topic} />

        <Pad size={32}/>
        <SmallTitleLabel label='Articles'/>
        <ArticlePreview article={article} />
        <QuietSystemMessage label='Other articles about this topic appear here, if there are any'/>
    </ScrollableScreen>
}

function ArticlePreview({article}) {
    console.log('article', article);
    return <Card pad={0} fitted>
        <Image source={{uri: expandUrl({url:article.photo, type:'photos'})}} style={{height: 200, width: 300}} />
        <PadBox>
            <SmallTitle width={200}>{article.title}</SmallTitle>        
        </PadBox>
    </Card>
}

function TopicListEmbed() {
    const topics = useCollection('topic', {sortBy: 'title'});
    return <View>        
        {topics.map(topic => <TopicPreview key={topic.key} topic={topic} />)}
    </View>
}

function TopicPreview({topic}) {
    const stances = useCollection('stance', {filter: {topic: topic.key}});
    const tStances = useTranslation('stances');
    return <ListItem onPress={() => pushSubscreen('topic', {topicKey: topic.key})}
        title={topic.title} subtitle={stances.length + ' ' +  tStances} />
}

function TopicStances({topic, compact}) {
    const stances = useCollection('stance', {filter: {topic: topic.key}});
    return <View>
        {/* <Center><SmallTitle>{topic.title}</SmallTitle></Center> */}
        {stances.map(stance => <Stance key={stance.key} stance={stance} compact={compact} />)}
    </View>
}

function Stance({stance, compact}) {
    return <Card onPress={() => pushSubscreen('stance', {stanceKey: stance.key})}>
        <SmallTitle>{stance.org}</SmallTitle>
        <PreviewText numberOfLines={compact ? 1 : 3} text={stance.text}/>
    </Card>
}

function StanceScreen({stanceKey}) {
    const stance = useObject('stance', stanceKey);
    const topic = useObject('topic', stance.topic);
    const personaKey = usePersonaKey();
    const persona = useObject('persona', personaKey);
    const datastore = useDatastore();

    return <ScrollableScreen>
        <SmallTitle>{stance.org}</SmallTitle>
        <BigTitle>{topic.title}</BigTitle>
        <Pad size={16}/>

        <SectionTitleLabel label='Public Stance' />

        <MaybeEditableText editable={persona.member}
                value={stance.text} 
                onChange={text => datastore.updateObject('stance', stanceKey, {text})}
                placeholder="What is your organzation's stance on this topic" 
        />  
        <Pad size={32} />
        <SectionTitleLabel label='Private Conversation' />

        <BasicComments about={stanceKey} config={{getIsVisible, authorBling: [GuestAuthorBling]}} />

        <Pad size={24}/>
        <QuietSystemMessage label='Non-members can only see messages they posted, or replies to their messages.'/>

    </ScrollableScreen>
}



function getIsVisible({datastore, comment}) {
    const personaKey = datastore.getPersonaKey();
    const userIsMember = datastore.getObject('persona', personaKey)?.member;

    if (userIsMember) {
        return true;
    } else if (!comment) {
        return false;
    } else if (comment?.from == personaKey) {
        return true;
    } else {
        return getIsVisible({datastore, comment: datastore.getObject('comment', comment?.replyTo)});
    }
}

