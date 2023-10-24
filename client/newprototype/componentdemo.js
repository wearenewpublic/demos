import { Text, View } from "react-native";
import { authorRobEnnals } from "../data/authors";
import { ProfilePhoto } from "../newcomponent/profilephoto";
import { usePersonaKey } from "../util/datastore";
import { personaK } from "../data/personas";
import { CircleCheck } from "../newcomponent/icon";
import { HorizBox, Narrow, Pad, ScrollableScreen } from "../component/basics";
import { ContentHeading, Heading, Paragraph, UtilityText } from "../newcomponent/text";
import { NewPublicTitle } from "../component/newpublic";

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
        <ContentHeading label='Content Heading' level={3} />

        <Text style={{fontSize: 48}}>Level 1 Fake</Text>

        <ContentHeading label='Level 1' level={1} />
        <ContentHeading label='Level 2' level={2} />
        <ContentHeading label='Level 3' level={3} />
        <ContentHeading label='Level 4' level={4} />

        <Pad size={16} />
        <ContentHeading label='Heading' level={2} />
        <Pad/>
        <Heading label='Heading' />

        <Pad size={16} />
        <ContentHeading label='Paragraph' level={2} />
        <Pad/>
        <Paragraph sizeType='large' label='Large' />
        <Paragraph sizeType='small' label='Small' />

        <Pad size={16} />
        <ContentHeading label='Utility' level={2} />
        <Pad/>
        <UtilityText sizeType='large' label='Large' />
        <UtilityText sizeType='small' label='Small' />
        <UtilityText sizeType='bold' label='Bold' />
        <UtilityText sizeType='tiny' label='Tiny' />
        <UtilityText sizeType='tinycaps' label='Tiny Caps' />



        <Pad size={16} />
        <ContentHeading label='Profile Photo' level={2} />
        <Pad />
        <HorizBox>
            <ProfilePhoto userId={personaKey} />
            <ProfilePhoto userId={personaKey} sizeType="small"/>
            <ProfilePhoto userId={personaKey} sizeType="xs"/>
            <ProfilePhoto userId={personaKey} check={true} />
            <ProfilePhoto userId={personaKey} sizeType="small" check/>
            <ProfilePhoto userId={personaKey} sizeType="xs" check/>
        </HorizBox>
        </Narrow>
     </ScrollableScreen>
}

