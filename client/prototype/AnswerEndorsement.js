import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BigTitle, BodyText, Card, Center, Clickable, HorizBox, Narrow, Pad, PillBox, ScreenTitleText, ScrollableScreen, SecondaryButton, SmallTitle, StatusButtonlikeMessage, UserFaceAndName, WideScreen } from "../component/basics";
import { BasicComments } from "../component/comment";
import { QuietSystemMessage } from "../component/message";
import { Post, PostActionButton, PostActionComment, PostActionEdit } from "../component/post";
import { PostInput } from "../component/replyinput";
import { TranslatableLabel, translateLabel, useLanguage, useTranslation } from "../component/translation";
import { UserFace } from "../component/userface";
import { answer_godzilla, answer_godzilla_comments } from "../data/answer";
import { authorRobEnnals } from "../data/authors";
import { useCollection, useDatastore, useGlobalProperty, useObject, usePersonaKey } from "../util/datastore";
import { pushSubscreen } from "../util/navigate";
import { addKey, boolToString, expandDataList, isNonEmpty, removeKey, stringToBool } from "../util/util";
import { View } from "react-native";
import { PopupSelector } from "../platform-specific/popup";

export const AnswerEndorsement = {
    key: 'qaendorsement',
    name: 'Answer Endorsement',
    date: 'Mon Aug 8 2023 19:27:04 GMT-0700 (Pacific Daylight Time)',
    author: authorRobEnnals,
    description: 'Answers can be endorsed by trusted groups. Author can choose to be anonomous other than to group members',
    screen: AnswerEndorsementScreen,
    subscreens: {
        groupList: {screen: GroupListScreen, title: 'Groups'},
        post: {screen: PostScreen, title: PostScreenTitle},
    },
    instance: [
        {
            key: 'godzilla', name: 'How should we deal with the Giant Monster?',
            question: 'How should we deal with the Giant Monster?',
            post: expandDataList(answer_godzilla),
            group: expandDataList([
                {key: 'science', name: 'The Institute of Important Scientists', admin: 'a'},
                {key: 'angry', name: 'The Angry Party', admin: 'b'},
                {key: 'monster', name: 'The Monster Protection League', admin: 'c'},
            ])
        }
    ],
}

function AnswerEndorsementScreen() {
    const question = useGlobalProperty('question');
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const groups = useCollection('group', {sortBy: 'name'});
    const personaKey = usePersonaKey();
    const hasAnswered = posts.some(post => post.from == personaKey);
    const myGroup = useCollection('group', {filter: {admin: personaKey}})[0];
    const filteredPosts = posts.filter(post => post.from == personaKey || isNonEmpty(post.endorsements) || post.submit == myGroup?.key);

    return <ScrollableScreen grey>
        <Card fitted onPress={() => pushSubscreen('groupList')}>
            <TranslatableLabel label='{count} Groups' formatParams={{count:groups.length}} />
        </Card>
        <BigTitle>{question}</BigTitle>
        {hasAnswered ? 
            <QuietSystemMessage label='You have already answered this question' />
        :
            <PostInput placeholder="What's your answer?" topWidgets={[EditEndorseRequest, EditAnonymous]} getCanPost={getCanPost}/>
        }

        {myGroup ? 
            <QuietSystemMessage label='Acting on behalf of {groupName}' formatParams={{groupName: myGroup.name}} />
        : null}
        {filteredPosts.map(post =>
            <EndorsablePost key={post.key} post={post} myGroup={myGroup} />
        )}

    </ScrollableScreen>
}

function getAuthorName({post, author, myPersonaKey, submittedToMyGroup, language}) {
    if (post.anon) {
        if (author.key == myPersonaKey) {
            return translateLabel({label: 'You Anonymously', language});
        } else if (submittedToMyGroup) {
            return translateLabel({label: '{name} (Anonymously)', formatParams: {name: author.name}, language});
        } else {
            return translateLabel({label: 'Anonymous', language});
        }
    } else {
        return null;
    }
}

function EndorsablePost({post, myGroup}) {
    const author = useObject('persona', post.from);
    const myPersonaKey = usePersonaKey();
    const language = useLanguage();
    const submittedToMyGroup = post.submit == myGroup?.key;
    const authorName = getAuthorName({post, author, myPersonaKey, submittedToMyGroup, language}); 
    return <Post key={post.key} post={post} 
        anonymousFace={post.anon && !submittedToMyGroup} authorName={authorName}
        hasComments onComment={() => pushSubscreen('post', {postKey: post.key})}
        topBling={<PostBlingEndorements post={post} />}
        editWidgets={[EditEndorseRequest, EditAnonymous]}
        actions={[PostActionGroupPrivateComment, PostActionEdit, PostActionEndorse]} />
}


function GroupListScreen() {
    const group = useCollection('group', {sortBy: 'name'});
    return <ScrollableScreen grey>
        <BigTitle>Groups</BigTitle>
        {group.map(group =>
            <GroupPreview key={group.key} group={group} />
        )}
    </ScrollableScreen>
}

function GroupPreview({group}) {
    return <Card>
        <SmallTitle>{group.name}</SmallTitle>
        <Pad size={4} />
        <UserFaceAndName personaKey={group.admin} extraLabel='is group admin' />
    </Card>
}

function PostScreenTitle({postKey}) {
    const post = useObject('post', postKey);
    const author = useObject('persona', post?.from);
    const tPost = useTranslation('Post');
    return <ScreenTitleText title={author.name + "'s " + tPost} />
}

export function PostScreen({postKey}) {
    const post = useObject('post', postKey);
    return <WideScreen>
        <Narrow>
            <Post noCard post={post} actions={[PostActionEdit, PostActionEndorse]} />
            <Pad/>
            <BasicComments about={postKey} />
        </Narrow>
    </WideScreen>   
}

function PostActionGroupPrivateComment({post}) {
    const personaKey = usePersonaKey();
    const group = useObject('group', post.submit);
    if (post.from == personaKey || group?.admin == personaKey) {
        return <PostActionComment post={post} />
    } else {
        return null;
    }
}

function PostActionEndorse({post}) {
    const personaKey = usePersonaKey();
    const datastore = useDatastore();
    const myGroup = useCollection('group', {filter: {admin: personaKey}})[0];
    if (!myGroup) return null;
    const hasEndorsement = post.endorsements && post.endorsements[myGroup.key];   
    const actionLabel = hasEndorsement ? 'Retract Endorsement' : 'Endorse';

    function endorsePost() {
        datastore.modifyObject('post', post.key, post => ({
            ...post, endorsements: hasEndorsement ? removeKey(post.endorsements, myGroup.key) : addKey(post.endorsements, myGroup.key)
        }));
    }

    if (post.submit != myGroup?.key && !hasEndorsement) return null;

    return <PostActionButton iconName='award' iconSet={FontAwesome5} label={actionLabel} formatParams={{groupName:myGroup.name}} onPress={endorsePost} />
}


function PostBlingEndorements({post}) {
    const endorsementList = Object.keys(post.endorsements || {});
    return <View>
        {endorsementList.map(groupKey =>
            <GroupEndorsement key={groupKey} groupKey={groupKey} />
        )}
        {post.submit && !post.endorsements?.[post.submit] ?
            <RequestedEndorsement groupKey={post.submit} />
        : null}
    </View>
}

function GroupEndorsement({groupKey}) {
    const group = useObject('group', groupKey);
    return <PillBox big color='#999'>
        <FontAwesome5 name='award' size={16} color='#999' />
        <Pad size={4} />
        <TranslatableLabel label='Endorsed by {groupName}' formatParams={{groupName: group.name}} />
    </PillBox>
}

function RequestedEndorsement({groupKey}) {
    const group = useObject('group', groupKey);
    return <PillBox big color='blue'>
        <FontAwesome name='question-circle' size={16} color='blue' />
        <Pad size={4} />
        <TranslatableLabel style={{color: 'blue'}} label='Submitted to {groupName}' formatParams={{groupName: group.name}} />
    </PillBox>
}


function EditEndorseRequest({post, onPostChanged}) {
    const groups = useCollection('group', {sortBy: 'name'});
    const groupItems = groups.map(group => ({key: group.key, label: group.name}));
    const tSelect = useTranslation('Select group to submit your answer to');
    const unknown = {key: 'unknown', label: tSelect};

    return <View>
        <PopupSelector value={post.submit} items={[unknown, ... groupItems]} 
            onSelect={submit => onPostChanged({...post, submit})} />
        <Pad />
    </View>
}

function EditAnonymous({post, onPostChanged}) {
    const group = useObject('group', post.submit);
    const tAnon = useTranslation('Anonymous except to {group}', {group: group?.name ?? 'group'});
    const tReal = useTranslation('Use your Real Name');
    const items = [{key: 'true', label: tAnon}, {key: 'false', label: tReal}]
    
    return <View>
        <PopupSelector value={boolToString(post.anon)} items={items} 
        onSelect={anon => onPostChanged({...post, anon: stringToBool(anon)})} />
        <Pad />
    </View>
}


function getCanPost({datastore, post}) {
    return post.submit && post.text;
}
