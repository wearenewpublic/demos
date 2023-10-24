import { Text, View } from "react-native";
import { authorRobEnnals } from "../data/authors";
import { Byline, FacePile, Persona, ProfilePhoto } from "../newcomponent/people";
import { usePersonaKey } from "../util/datastore";
import { personaK } from "../data/personas";
import { IconAudio, IconCircleCheck, IconComment, IconEdit, IconEmoji, IconImage, IconReply, IconReport, IconSave, IconUpvote, IconVideo } from "../newcomponent/icon";
import { HorizBox, Narrow, Pad, ScrollableScreen } from "../component/basics";
import { ContentHeading, Heading, Paragraph, UtilityText } from "../newcomponent/text";
import { NewPublicTitle } from "../component/newpublic";
import { colorPink, colorTextGrey } from "../newcomponent/color";
import { CTAButton, DropDownSelector, ExpanderButton, IconButton, ReactionButton, SubtleButton, Tag } from "../newcomponent/button";
import { translatePlural, useLanguage } from "../component/translation";
// import { Byline } from "../newcomponent/byline";

export const ComponentDemoPrototype = {
    key: 'componentdemo',
    name: 'Component Demo',
    author: authorRobEnnals,
    date: '2023-10-23',
    description: 'Demonstrate production components',
    screen: ComponentDemoScreen,
    instance: [
        {key: 'demo', name: 'Demo'}
    ]
}

function ComponentDemoScreen() {
    const personaKey = usePersonaKey();
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
            <DemoSection label='Profile Photo'>
                <HorizBox>
                    <ProfilePhoto userId={personaKey} />
                    <ProfilePhoto userId={personaKey} type="small"/>
                    <ProfilePhoto userId={personaKey} type="tiny"/>
                    <ProfilePhoto userId={personaKey} check={true} />
                    <ProfilePhoto userId={personaKey} type="small" check/>
                    <ProfilePhoto userId={personaKey} type="tiny" check/>
                </HorizBox>
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
                <ExpanderButton label='Show More' type='small' />
                <ExpanderButton label='Show More' />
                <ExpanderButton userList={['a','b','c','d']} label='{count} {noun}' 
                    formatParams={{count: 22, singular: 'reply', plural: 'replies'}} />
            </DemoSection>
            <DemoSection label='Tag'>
                <Tag label='Subtle Tag' type='subtle' />
                <Tag label='🔥 Emphasized Tag' type='emphasized' color={colorPink} />
            </DemoSection>
            <DemoSection label='Reaction Button'>
                <ReactionButton label='🤝🏽 Respect' count={1} />
            </DemoSection>
            <DemoSection label='DropDownSelector'>
                <DropDownSelector label='Sort by' options={[
                    {key: 'recent', label: 'Most recent'},
                    {key: 'top', label: 'Top voted'}
                ]} />
            </DemoSection>
        </Narrow>
     </ScrollableScreen>
}

function DemoSection({label, horiz=false, children}) {
    return <View style={{marginBottom: 32}}>
        <ContentHeading label={label} level={2} />
        <Pad size={8} />
        <SpacedArray horiz={horiz}>{children}</SpacedArray>
        {/* {children} */}
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
