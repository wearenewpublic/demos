import { Image, StyleSheet, Text, View } from "react-native";
import { fileHostDomain } from "../util/config";
import { Separator } from "./basics";

export function Article({article, children}) {
    const s = ArticleStyle;
    
    const paragraphs = article.rawText.trim().split('\n').filter(x=>x);

    return <View style={s.outer}>
        <View style={s.narrowSection}>
            <Text style={s.title}>{article.title}</Text>
            <Text style={s.subtitle}>{article.subtitle}</Text>
        </View>
        {article.photo ? 
            <View style={s.photoBox}>
                <Image style={s.photo} source={{uri: fileHostDomain + '/photos/' + article.photo}}/> 
                <Text style={s.photoCaption}>{article.photoCaption}</Text>
            </View>
        : null}
        <View style={s.narrowSection}>
            <View style={s.authorBox}>
                <Image style={s.authorFace}
                    source={{uri: fileHostDomain + '/faces/' + article.authorFace}} />
                <View>
                    <Text style={s.authorName}>By {article.author}</Text>
                    <Text style={s.date}>{article.date}</Text>
                </View>
            </View>
            <View style={s.pargraphHolder}>
                {paragraphs.map((paragraph, i) => 
                    <Text key={i} style={s.paragraph}>{paragraph}</Text>
                )}
            </View>
        </View>
        <Separator />
        <View style={s.comments}>
            {children}
        </View>
    </View>
}

const ArticleStyle = StyleSheet.create({
    narrowSection: {
        maxWidth: 500,
        alignSelf: 'center',
    },
    outer: {
    },
    comments: {
        alignSelf: 'center',
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

function parseArticle(rawArticle) {
    const lines = rawArticle.split('\n');
    var title = null;
    var subtitle = null;
    var photo = null;
    var author = null;
    var date = null;
    var paragraphs = [];
    for (const line of lines) {
        const [key, value] = line.split(':');
        switch (key.toLowerCase().trim()) {
            case 'title': title = value.trim(); break;
            case 'subtitle': subtitle = value.trim(); break;
            case 'photo': photo = value.trim(); break;
            case 'author': author = value.trim(); break;
            case 'date': date = value.trim(); break;
            default: paragraphs.push(line);
        }
    }
    return {title, subtitle, author, date, photo, paragraphs};
}
