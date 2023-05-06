import { StyleSheet, Text, View } from "react-native";
import { useCollection, useObject } from "../util/localdata";
import { UserFace } from "./userface";

export function Comment({commentKey}) {
    const s = CommentStyle;
    const comment = useObject('comment', commentKey);
    return <View style={s.commentHolder}>
        <View style={s.commentLeft}>
            <UserFace userId={comment.from} />
            <View style={s.verticalLine} />
        </View>
        <View style={s.commentRight}>
            <View style={s.commentBox}>
                <CommentAuthorInfo commentKey={commentKey} />
                <Text>{comment.text}</Text>
            </View>
            <Replies commentKey={commentKey} />
        </View>

    </View>
}

const CommentStyle = StyleSheet.create({
    commentHolder: {
        flexDirection: 'row',
        // marginHorizontal: 8,
        marginTop: 16,
    },
    commentLeft: {

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

function Replies({commentKey}) {
    const s = RepliesStyle;
    const comments = useCollection('comment');
    const replies = comments.filter(c => c.replyTo == commentKey);
    return <View style={s.repliesHolder}>
        {replies.map(reply => <Comment commentKey={reply.key} />)}
    </View>
}

const RepliesStyle = StyleSheet.create({
    repliesHolder: {
    }
})

function CommentAuthorInfo({commentKey}) {
    const s = CommentAuthorInfoStyle;
    const comment = useObject('comment', commentKey);
    const user = useObject('persona', comment.from);
    return <View style={s.authorInfoBox}> 
        <Text style={s.authorName}>{user.name}</Text>
    </View>
}

const CommentAuthorInfoStyle = StyleSheet.create({
    authorInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 12
    }
});
