
import { ScrollView, Text, View } from "react-native"
import { Card, Clickable, ScrollableScreen, BigTitle, BodyText, Separator, SmallTitle, SectionTitle, MarkdownBodyText, HorizBox, TimeText, AuthorLine, Pad, Narrow, Center } from "../component/basics"
import { NewPublicBodySection } from "../component/newpublic"

export function PrototypeInstanceListScreen({prototype, onSelectInstance}) {
    return <ScrollView>
        <NewPublicBodySection>
            <Narrow>
                <Card>
                    <AuthorLine author={prototype.author} time={prototype.date} oneLine />
                    <Pad size={4} />
                    <BigTitle pad={false}>{prototype.name}</BigTitle>
                    <MarkdownBodyText text={prototype.description} />      
                </Card>
                {/* <Separator />          */}
                <Pad />
                <Center><SectionTitle>Role Play Instances</SectionTitle></Center>
                {prototype.instance.map(instance => (
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

