
import { ScrollView, Switch, Text, View } from "react-native"
import { Card, Clickable, ScrollableScreen, BigTitle, BodyText, Separator, SmallTitleLabel, SectionTitleLabel, MarkdownBodyText, HorizBox, TimeText, AuthorLine, Pad, Narrow, Center, PrimaryButton, PadBox } from "../component/basics"
import { NewPublicBodySection } from "../component/newpublic"
import { useState } from "react";
import { YouTube } from "../platform-specific/youtube";
import { ExpandSection } from "../component/expand-section";
import { useFirebaseData, useFirebaseUser } from "../util/firebase";
import { QuietSystemMessage } from "../component/message";

export function PrototypeInstanceListScreen({prototype, onSelectInstance}) {
    const firebaseUser = useFirebaseUser();
    const [split, setSplit] = useState(prototype.split);
    // const userInstanceMap = useFirebaseData(['prototype', prototype.key, 'userInstance', firebaseUser?.uid], {});
    const userInstanceMap = useFirebaseData(['userInstance', firebaseUser?.uid, prototype.key], {});
    const userInstanceList = Object.entries(userInstanceMap || {}).map(([key, value]) => ({key, ...value}));
    const sortedUserInstances = userInstanceList.sort((a, b) => b.createTime - a.createTime);
    function onToggleSplit() {
        prototype.split = !split;
        setSplit(!split);
    }
    return <ScrollView>
        <NewPublicBodySection>
            <Narrow>
                <Card>
                    <AuthorLine author={prototype.author} time={prototype.date} oneLine />
                    <Pad size={4} />
                    <BigTitle pad={false}>{prototype.name}</BigTitle>
                    <MarkdownBodyText text={prototype.description} />      
                </Card>
                <Pad />
                {prototype.instance ?
                    <View>
                        <Center>
                            <SectionTitleLabel label='Role Play Instances' />
                        </Center>
                        <SplitToggle split={split} onToggle={onToggleSplit} />
                        <Pad/>
                        {prototype.instance.map(instance => (
                            <Card key={instance.key} onPress={() => onSelectInstance(instance.key)} vMargin={4}>
                                <SmallTitleLabel label={instance.name}/>
                            </Card>
                        ))}      
                    </View>
                : null}
                {prototype.newInstanceParams ?
                    <View>
                        <Pad size={16} />
                        <Center>
                            <HorizBox center>
                                <SectionTitleLabel label='Your Live Instances'/>
                                {/* <PrimaryButton label='New' onPress={() => onSelectInstance('new')} /> */}

                            </HorizBox>
                        </Center>
                        <PadBox horiz={16}><PrimaryButton label='New Live Instance' onPress={() => onSelectInstance('new')} /></PadBox>
                        {sortedUserInstances.map(instance => (
                            <Card key={instance.key} onPress={() => onSelectInstance(instance.key)} vMargin={4}>
                                <SmallTitleLabel label={instance.name} />
                            </Card>
                        ))}      
                        {userInstanceMap == null ? 
                            <QuietSystemMessage label='Loading...' />
                        : null}
                    </View>
                : null}            
            </Narrow>
            <Pad size={16} />
        </NewPublicBodySection>
    </ScrollView>
}

function SplitToggle({split, onToggle}) {
    return <HorizBox center>
        <Pad size={12} />
        <Text>Split Screen</Text>
        <Pad size={8} />
        <Switch value={split} onValueChange={onToggle} />
    </HorizBox>
}