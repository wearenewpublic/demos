import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { fileHostDomain } from "../util/config";
import { BigTitle, Narrow, Pad, ScrollableScreen, Separator, SmallTitleLabel, WideScreen } from "./basics";
import { TranslatableLabel } from "./translation";
import { expandUrl } from "../util/util";
import { useGlobalProperty } from "../util/datastore";

export function Article({article, embed=null, children}) {
    const s = ArticleStyle;
    
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
                    source={{uri: expandUrl({url: article.authorFace, type: 'faces'})}} />
                <View>
                    <Text style={s.authorName}><TranslatableLabel label='By'/> {article.author}</Text>
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
        <Narrow>
            {children}
        </Narrow>
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
    const title = useGlobalProperty('title');
    if (article ?? globalArticle) {
       return <ScrollableScreen maxWidth={800}>
            <Article article={article ?? globalArticle} embed={embed}>
                <SmallTitleLabel label={articleChildLabel} />
                {children}
                <Pad size={32} />
            </Article>
        </ScrollableScreen>
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
