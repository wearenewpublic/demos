
import { ScrollView, Text, View } from "react-native"
import { Card, Clickable, ScrollableScreen, BigTitle, BodyText, Separator, SmallTitle, SectionTitle, MarkdownBodyText, HorizBox, TimeText, AuthorLine, Pad, Narrow, Center } from "../component/basics"
import { NewPublicBodySection } from "../component/newpublic"

export function DemoInstanceListScreen({demo, onSelectInstance}) {
    return <ScrollView>
        <NewPublicBodySection>
            <Narrow>
                <Card>
                    <AuthorLine author={demo.author} time={demo.date} oneLine />
                    <Pad size={4} />
                    <BigTitle pad={false}>{demo.name}</BigTitle>
                    <MarkdownBodyText text={demo.description} />      
                </Card>
                {/* <Separator />          */}
                <Pad />
                <Center><SectionTitle>Role Play Instances</SectionTitle></Center>
                {demo.instance.map(instance => (
                    <Clickable key={instance.key} onPress={() => onSelectInstance(instance.key)}>
                        <Card>
                            <SmallTitle>{instance.name}</SmallTitle>
                        </Card>
                    </Clickable>
                ))}      
            </Narrow>
        </NewPublicBodySection>
    </ScrollView>
}

