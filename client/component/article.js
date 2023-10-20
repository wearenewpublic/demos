import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { fileHostDomain } from "../util/config";
import { BigTitle, Center, Narrow, Pad, ScrollableScreen, Separator, SmallTitleLabel, WideScreen } from "./basics";
import { TranslatableLabel, languageFrench, languageGerman, useLanguage } from "./translation";
import { expandUrl } from "../util/util";
import { useGlobalProperty } from "../util/datastore";
import { useFirebaseData } from "../util/firebase";
import { godzilla_article } from "../data/articles/godzilla";
import { godzilla_article_french } from "../translations/french/articles_french";
import { godzilla_article_german } from "../translations/german/articles_german";
import { trek_wars_article } from "../data/articles/startrekwars";
import { cbc_sport_article } from "../data/articles/cbc_sport";
import { cbc_sport_article_french } from "../translations/french/cbc_sport_article_french";
import { cbc_sport_article_german } from "../translations/german/cbc_sport_article_german";
import { FakeVideoScreen } from "./fakevideo";

export function Article({articleKey, article, embed=null, children}) {
    const s = ArticleStyle;

    const keyArticle = useArticle(articleKey);   
    article = article ?? keyArticle;
    if (!article) return null;

    const paragraphs = article?.rawText?.trim()?.split('\n')?.filter(x=>x);

    return <View style={s.outer}>
        <View style={s.narrowSection}>
            <Text style={s.title}>{article.title}</Text>
            <Text style={s.subtitle}>{article.subtitle}</Text>
        </View>
        {article.photo ? 
            <View style={s.photoBox}>
                <Image style={s.photo} source={{uri: expandUrl({url: article.photo, type: 'photos'})}}/> 
                <Text style={s.photoCaption}>{article.photoCaption}</Text>
            </View>
        : null}
        <View style={s.narrowSection}>
            <View style={s.authorBox}>
                <Image style={s.authorFace}
                    source={{uri: expandUrl({url: article.authorFace ?? 'face2.jpeg', type: 'faces'})}} />
                <View>
                    <Text style={s.authorName}><TranslatableLabel label='By'/> {article.author ?? article.authorName}</Text>
                    <Text style={s.date}>{article.date}</Text>
                </View>
            </View>
            <View style={s.pargraphHolder}>
                {paragraphs.map((paragraph, i) => 
                    (i == 2 && embed) ? 
                        <View key={i}>
                            <View style={s.embed}>
                                {embed}
                            </View>
                            <Text key={i} style={s.paragraph}>{paragraph}</Text>
                        </View>
                    :
                    <Text key={i} style={s.paragraph}>{paragraph}</Text>
                )}
            </View>
        </View>
        <Separator />
        {children}
    </View>
}

const ArticleStyle = StyleSheet.create({
    narrowSection: {
        maxWidth: 500,
        alignSelf: 'center',
    },
    outer: {
    },
    embed: {
        marginBottom: 24,
        marginTop: 8,
        marginHorizontal: 16
    },  
    comments: {
        alignSelf: 'stretch',
    },
    photo: {
        width: 800,
        height: 400,
        objectFit: 'cover',
    },
    photoBox: {
        width: 800,
        marginBottom: 32
    },
    photoCaption: {
        fontWeight: '400',
        fontSize: 13,
        color: 'rgb(114,114,114)',
    },
    authorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    authorFace: {
        width: 32, 
        height: 32,
        borderRadius: 16,
    },
    authorName: {
        fontFamily: 'Helvetica',
        fontSize: 14,
        marginLeft: 8,
        fontWeight: 'bold'
    },
    date: {
        color: 'rgb(114,114,114)',  
        fontSize: 12,
        marginLeft: 8
    },
    title: {
        fontFamily: 'Georgia',
        fontWeight: '700',
        fontSize: 40,
        fontStyle: 'italic',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Georgia',
        fontSize: 23,
        color: 'rgb(54,54,54)',
        marginBottom: 30
    },
    paragraph: {
        fontFamily: 'Georgia',
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 15,
        maxWidth: 500,
    }
})


export function MaybeArticleScreen({article, embed, articleChildLabel, children}) {
    const globalArticle = useGlobalProperty('article');
    const globalArticleKey = useGlobalProperty('articleKey');
    const globalVideoKey = useGlobalProperty('videoKey');
    const title = useGlobalProperty('title');
    if (article || globalArticle || globalArticleKey) {
       return <ScrollableScreen maxWidth={800}>
            <Article article={article ?? globalArticle} articleKey={globalArticleKey} embed={embed}>
                <Center><SmallTitleLabel label={articleChildLabel} /></Center>
                {children}
                <Pad size={32} />
            </Article>
        </ScrollableScreen>
    } else if (globalVideoKey) {
        return <FakeVideoScreen articleChildLabel={articleChildLabel}>{children}</FakeVideoScreen>
    } else {        
        return <WideScreen pad>
            <ScrollView>
                <Pad size={8} />
                {title ? <BigTitle>{title}</BigTitle> : null}
                {children}
            </ScrollView>
        </WideScreen>
    }
}

function getBuiltInArticle(articleKey, language) {
    if (articleKey == 'godzilla') {
        if (language == languageFrench) {
            return godzilla_article_french
        } else if (language == languageGerman) {
            return godzilla_article_german
        } else {
            return godzilla_article;
        }
    } else if (articleKey == 'soccer') {
        if (language == languageFrench) {
            return cbc_sport_article_french
        } else if (language == languageGerman) {
            return cbc_sport_article_german;
        } else {
            return cbc_sport_article;
        }
    } else if (articleKey == 'starwars') {
        return trek_wars_article;
    } else if (process.env.NODE_ENV == 'test') {
        return godzilla_article;
    } else {
        return null;
    }
}

export const articleGodzilla = 'godzilla'
export const articleSoccer = 'soccer'
export const articleStarWars = 'starwars'

export function useArticle(articleKey) {
    const language = useLanguage();
    const langToSuffix = {
        English: '',
        French: '_french',
        German: '_german'
    }
    const suffix = langToSuffix[language] || '';
    const article = useFirebaseData(['prototype', 'articlegen', 'instance', 'articles', 
    'collection', 'article' + suffix, articleKey]);
    const builtInArticle = getBuiltInArticle(articleKey, language);

    return builtInArticle ?? article;
}