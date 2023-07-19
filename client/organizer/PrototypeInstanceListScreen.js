
import { ScrollView, Text, View } from "react-native"
import { Card, Clickable, ScrollableScreen, BigTitle, BodyText, Separator, SmallTitle, SectionTitle, MarkdownBodyText, HorizBox, TimeText, AuthorLine, Pad, Narrow, Center } from "../component/basics"
import { NewPublicBodySection } from "../component/newpublic"
import { useState } from "react";
import { YouTube } from "../platform-specific/youtube";
import { ExpandSection } from "../component/expand-section";

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
                <Pad />
                {prototype.instance ?
                    <View>
                        <Center><SectionTitle text='Role Play Instances' /></Center>
                        {prototype.instance.map(instance => (
                            <Clickable key={instance.key} onPress={() => onSelectInstance(instance.key)}>
                                <Card>
                                    <SmallTitle text={instance.name}/>
                                </Card>
                            </Clickable>
                        ))}      
                    </View>
                : null}
                {prototype.liveInstance ?
                    <View>
                        <Center><SectionTitle text='Live Instances'/></Center>
                        {prototype.liveInstance.map(instance => (
                            <Clickable key={instance.key} onPress={() => onSelectInstance(instance.key)}>
                                <Card>
                                    <SmallTitle text={instance.name} />
                                </Card>
                            </Clickable>
                        ))}      
                    </View>
                : null}

                {prototype.video ? 
                    <View>
                        <Center><SectionTitle text='Concept Videos'/></Center>
                        {prototype.video.map(video => 
                            <VideoPreview key={video.name} video={video} />
                        )}      
                    </View>
                : null}            
            </Narrow>
            <Pad size={16} />
        </NewPublicBodySection>
    </ScrollView>
}

function VideoPreview({video}) {
    return <ExpandSection title={video.name}>
        <YouTube videoId={video.youtube} />
    </ExpandSection>
}

