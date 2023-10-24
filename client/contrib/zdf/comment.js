import { StyleSheet, Text, View } from "react-native";
import { UserFace } from "../../component/userface";
import React from "react";
import { BlingLabel } from "../../component/comment";


export function StickyComment({text}) {
    const s = StickyCommentStyle;

    return <View style={s.commentHolder}>
        <View style={s.commentLeft}>
            <UserFace style="s.roboFace" userId="robo" faint={false} />
            <View style={s.verticalLine} />
        </View>
        <View style={s.commentRight}>
            <View style={s.commentBox}>
                <RoboAuthorInfo/>
                <BlingStickyHelp/>
                <Text style={s.text}>{text}</Text>
            </View>
        </View>
    </View>
}

const StickyCommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        marginTop: 16,
        backgroundColor: "#EBF3FB",
        borderColor: "#63A4E5",
        borderWidth: 1,
        maxWidth: 523,
        padding: 16,
        borderRadius: 10,
        boxShadow: "3px 3px 2px rgba(111, 118, 124, 0.5)",
    },
    text: {
        fontSize: 15,
        color: '#333',
        maxWidth: 500
    },
    verticalLine: {
        backgroundColor: '#ccc',
        width: 1,
        flex: 1,
        alignSelf: 'center',
        marginTop: 4
    },
    commentRight: {
        flex: 1,
    },
    commentBox: {
        flex: 1,
        marginLeft: 12,
    }
})

function BlingStickyHelp() {
    return <BlingLabel label='💡 Help' color="#63A4E5" />
}

function RoboAuthorInfo() {
    const s = RoboAuthorInfoStyle;

    return <View style={s.authorInfoBox}> 
        <View style={s.authorNameBox}>
            <Text style={s.authorName}>Robot</Text>
            <Text>📌</Text>
        </View>
    </View>
}

const RoboAuthorInfoStyle = StyleSheet.create({
    authorInfoBox: {
        marginBottom: 2
    },
    roboFace: {
        marginLeft: 16,
    },
    authorNameBox: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: "space-between" 
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 12
    }
});