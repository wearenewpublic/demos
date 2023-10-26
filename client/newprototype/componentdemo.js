import { Switch, Text, View } from "react-native";
import { authorRobEnnals } from "../data/authors";
import { Byline, FacePile, Persona, ProfilePhoto } from "../newcomponent/people";
import { usePersonaKey } from "../util/datastore";
import { personaK } from "../data/personas";
import { IconAudio, IconCircleCheck, IconComment, IconEdit, IconEmoji, IconImage, IconReply, IconReport, IconSave, IconUpvote, IconVideo } from "../newcomponent/icon";
import { HorizBox, Narrow, Pad, PrimaryButton, ScrollableScreen } from "../component/basics";
import { ContentHeading, Heading, Paragraph, TextField, UtilityText } from "../newcomponent/text";
import { NewPublicTitle } from "../component/newpublic";
import { colorBlueBackgound, colorPink, colorTextGrey } from "../newcomponent/color";
import { CTAButton, DropDownSelector, ExpanderButton, IconButton, ReactionButton, SubtleButton, Tag, Toggle } from "../newcomponent/button";
import { translatePlural, useLanguage } from "../component/translation";
import { useState } from "react";
import { expandDataList } from "../util/util";
import { Comment } from "../newcomponent/comment";
import { pushSubscreen } from "../util/navigate";
// import { Byline } from "../newcomponent/byline";

export const ComponentDemoPrototype = {
    key: 'componentdemo',
    name: 'Component Demo',
    author: authorRobEnnals,
    date: '2023-10-23',
    description: 'Demonstrate production components',
    screen: ComponentDemoScreen,
    subscreens: {
        text: {screen: TextScreen, title: 'Text'},
        profile: {screen: ProfileScreen, title: 'Profile'},
        button: {screen: ButtonScreen, title: 'Buttons'},
        comment: {screen: CommentScreen, title: 'Comment'},
    },
    instance: [
        {key: 'demo', name: 'Demo', comment: expandDataList([
            {key: 'a', from: 'd', text: 'This is a comment'},
            {key: 'b', from: 'b', replyTo: 'a', text: 'This is a reply'},
            {key: 'c', from: 'c', replyTo: 'a', text: 'This is another reply. This reply contains a lot of text so that it tests the challenge of a comment being too long.\nThis reply contains a lot of text so that it tests the challenge of a comment being too long.\nThis reply contains a lot of text so that it tests the challenge of a comment being too long.\nThis reply contains a lot of text so that it tests the challenge of a comment being too long.\nThis reply contains a lot of text so that it tests the challenge of a comment being too long.\nThis reply contains a lot of text so that it tests the challenge of a comment being too long.\nThis reply contains a lot of text so that it tests the challenge of a comment being too long.\n '}

        ])}
    ]
}

function TextScreen() {
    const [text, setText] = useState(null);
    return <ScrollableScreen>
        <Narrow>
            <DemoSection label='Content Text'>
                <ContentHeading label='Level 1' level={1} />
                <ContentHeading label='Level 2' level={2} />
                <ContentHeading label='Level 3' level={3} />
                <ContentHeading label='Level 4' level={4} />
            </DemoSection>
            <DemoSection label='UI Text'>
                <Heading label='Heading' />
                <Paragraph type='large' label='Paragraph:Large' />
                <Paragraph type='small' label='Paragraph:Small' />
                <UtilityText type='large' label='Utility:Large' />
                <UtilityText type='small' label='Utility:Small' />
                <UtilityText type='small' color={colorTextGrey} label='Utility:Small color:TextGrey' />
                <UtilityText type='small' bold label='Utility:Small Bold' />
                <UtilityText type='small' underline label='Utility:Small Underline' />
                
                <UtilityText type='tiny' label='Utility:Tiny' />
                <UtilityText type='tinycaps' label='Utility:Tiny Caps' />
            </DemoSection>
            <DemoSection label='Text Field'>
                <TextField value={text} placeholder='Enter some text' onChange={setText} />
            </DemoSection>
        </Narrow>
    </ScrollableScreen>
}

function ProfileScreen() {
    const personaKey = usePersonaKey();
    return <ScrollableScreen >
        <Narrow>
            <DemoSection label='Profile Photo'>
                <SpacedArray horiz pad={8}>
                    <ProfilePhoto userId={personaKey} />
                    <ProfilePhoto userId={personaKey} type="small"/>
                    <ProfilePhoto userId={personaKey} type="tiny"/>
                    <ProfilePhoto userId={personaKey} check={true} />
                    <ProfilePhoto userId={personaKey} type="small" check/>
                    <ProfilePhoto userId={personaKey} type="tiny" check/>
                </SpacedArray>
            </DemoSection>
            <DemoSection label='Facepile'>
                <FacePile userIdList={['a','b','c']} />
                <FacePile userIdList={['a','b','c']} type='small' />
                <FacePile userIdList={['a','b','c','d','e','f']} type='tiny' />
            </DemoSection>
            <DemoSection label='Byline'>
                <Byline userId={personaKey} time={Date.now()} />
                <Byline userId={personaKey} type='small' time={Date.now()} />
            </DemoSection>
            <DemoSection label='Persona'>
                <Persona userId={personaKey} />
            </DemoSection>
        </Narrow>
     </ScrollableScreen>
}

function ButtonScreen() {
    const [switchValue, setSwitchValue] = useState(false);
    const [dropDownValue, setDropDownValue] = useState(null);
    const [expanded, setExpanded] = useState(false);
    return <ScrollableScreen >
        <Narrow>

            <DemoSection label='CTA Button'>
                <SpacedArray horiz>
                    <CTAButton label='Primary Button' type='primary' />
                    <CTAButton label='Secondary Button' type='secondary' />
                    <CTAButton label='Accent Button' type='accent' />
                </SpacedArray>
                <SpacedArray horiz>
                    <CTAButton label='✨ Accent with Emoji' type='accent' />
                    <CTAButton label='Disabled Button' type='primary' disabled />
                </SpacedArray>
            </DemoSection>
            <DemoSection label='Icon Button'>
                <SpacedArray horiz>
                    <IconButton icon={IconReply} label='Reply' />
                    <IconButton icon={IconComment} label='Comment' />
                    <IconButton icon={IconEdit} label='Edit' />
                    <IconButton icon={IconSave} label='Save' />
                </SpacedArray>
                <SpacedArray horiz>
                    <IconButton icon={IconImage} label='Image' />
                    <IconButton icon={IconAudio} label='Audio' />
                    <IconButton icon={IconVideo} label='Video' />
                    <IconButton icon={IconEmoji} label='Emoji' />
                </SpacedArray>
            </DemoSection>
            <DemoSection label='Subtle Button'>
                <SpacedArray horiz>
                    <SubtleButton icon={IconReply} label='Reply' />
                    <SubtleButton icon={IconUpvote} label='Upvote ({count})' formatParams={{count: 22}} />
                    <SubtleButton icon={IconReport} label='Report' />
                    <SubtleButton icon={IconComment} label='{count} {noun}' 
                        formatParams={{singular: 'comment', plural: 'comments', count: 12}} />
                </SpacedArray>
            </DemoSection>
            <DemoSection label='Expander Button'>
                <ExpanderButton label='Show More' type='small' expanded={expanded} setExpanded={setExpanded} />
                <ExpanderButton label='Show More' expanded={expanded} setExpanded={setExpanded} />
                <ExpanderButton userList={['a','b','c','d']} label='{count} {noun}' 
                    formatParams={{count: 22, singular: 'reply', plural: 'replies'}} expanded={expanded} setExpanded={setExpanded} />
            </DemoSection>
            <DemoSection label='Tag'>
                <Tag label='Subtle Tag' type='subtle' />
                <Tag label='🔥 Emphasized Tag' type='emphasized' color={colorPink} />
            </DemoSection>
            <DemoSection label='Reaction Button'>
                <ReactionButton label='🤝🏽 Respect' count={1} />
            </DemoSection>
            <DemoSection label='DropDownSelector'>
                <DropDownSelector label='Sort by' 
                    value={dropDownValue} onChange={setDropDownValue}
                    options={[
                        {key: 'recent', label: 'Most recent'},
                        {key: 'top', label: 'Top voted'}
                ]} />
            </DemoSection>
            <DemoSection label='Toggle'>
                <Toggle label='Toggle' value={switchValue} onChange={setSwitchValue} />
            </DemoSection>
        </Narrow>
     </ScrollableScreen>
}


function CommentScreen() {
    return <ScrollableScreen backgroundColor={colorBlueBackgound}>
        <Narrow>

            <DemoSection label='Comment'>
                <Comment commentKey='a' />
            </DemoSection>
        </Narrow>
     </ScrollableScreen>
}

function ComponentDemoScreen() {
    return <ScrollableScreen>
        <Narrow>
            <ContentHeading label='Compenent Groups' />
            <Pad size={20} />
            <SpacedArray>
                <PrimaryButton label='Text' onPress={() => pushSubscreen('text')} />
                <PrimaryButton label='Profile' onPress={() => pushSubscreen('profile')} />
                <PrimaryButton label='Button' onPress={() => pushSubscreen('button')} />
                <PrimaryButton label='Comment' onPress={() => pushSubscreen('comment')} />
            </SpacedArray>
        </Narrow>
    </ScrollableScreen>
}



function DemoSection({label, horiz=false, children}) {
    return <View style={{marginBottom: 32}}>
        <ContentHeading label={label} level={2} />
        <Pad size={8} />
        <SpacedArray horiz={horiz}>{children}</SpacedArray>
    </View>
}

function SpacedArray({pad=16, horiz=false, children}) {
    if (children.length > 1) {
        return <View style={horiz ? {flexDirection: 'row'} : null}>
            {children.map((c, i) => <View key={i} style={horiz ? {flexDirection: 'row'} : null}>
                {c}
                {i < children.length - 1 ? <Pad size={pad} /> : null}
            </View>)}
        </View>
    } else {
        return children;
    }
}
