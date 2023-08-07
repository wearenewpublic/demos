import { useState, useTransition } from "react";
import { authorRobEnnals } from "../data/authors";
import { post_starwars } from "../data/posts";
import { useCollection, useGlobalProperty, usePersonaKey } from "../util/datastore";
import { expandDataList } from "../util/util";
import { BigTitle, Card, Pad, Pill, ScrollableScreen, SectionTitleLabel } from "../component/basics";
import { QuietSystemMessage } from "../component/message";
import { PostInput } from "../component/replyinput";
import { Post, PostActionEdit, PostActionLike } from "../component/post";
import { squaremapCanada, squaremapFrance, squaremapGermany, squaremapNamesCanada, squaremapNamesCanadaFrench, squaremapNamesFrance, squaremapNamesGermany, squaremapNamesUsa, squaremapUsa } from "../data/squaremaps";
import { SquareMap } from "../component/squaremap";
import { PopupSelector } from "../platform-specific/popup";
import { post_starwars_canada, post_starwars_france } from "../translations/french/posts_french";
import { languageFrench, languageGerman, useLanguage, useTranslation } from "../component/translation";
import { post_starwars_german } from "../translations/german/posts_german";

export const MissingPerspectivesPrototype = {
    key: 'missingperspectives',
    date: 'Wed Jul 26 2023 20:50:03 GMT-0700 (Pacific Daylight Time)',
    name: 'Missing Perspectives',
    author: authorRobEnnals,
    description: 'Show a map that illustrates where we are hearing opinions from, and where we are not',
    screen: MissingPerspectivesScreen,
    instance: [
        {
            key: 'wars', name: 'Star Wars USA',
            mapName: 'usa',
            question: 'Which is better. Star Wars or Star Trek?',
            post: expandDataList(post_starwars)
        },
        {
            key: 'wars-binary', name: 'Star Wars USA Binary', binary: true,
            mapName: 'usa',
            question: 'Which is better. Star Wars or Star Trek?',
            post: expandDataList(post_starwars)
        },
        {
            key: 'wars-canada', name: 'Star Wars Canada (French)', language: languageFrench,
            mapName: 'canada',
            question: 'Lequel est meilleur. Star Wars ou Star Trek?',
            post: expandDataList(post_starwars_canada)
        },
        {
            key: 'wars-canada-binary', name: 'Star Wars Canada Binary (French)', language: languageFrench,
            mapName: 'canada',
            question: 'Lequel est meilleur. Star Wars ou Star Trek?',
            post: expandDataList(post_starwars_canada)
        },
        {
            key: 'wars-france', name: 'Star Wars France (French)', language: languageFrench,
            mapName: 'france',
            question: 'Lequel est meilleur. Star Wars ou Star Trek?',
            post: expandDataList(post_starwars_france)
        },
        {
            key: 'wars-france-binary', name: 'Star Wars France Binary (French)', language: languageFrench, binary: true,
            mapName: 'france',
            question: 'Lequel est meilleur. Star Wars ou Star Trek?',
            post: expandDataList(post_starwars_france)
        },
        {
            key: 'wars-germany', name: 'Star Wars (German)', language: languageGerman,
            mapName: 'germany',
            question: 'Was ist besser, Star Wars oder Star Trek?',
            post: expandDataList(post_starwars_german)
        },
        {
            key: 'wars-germany-binary', name: 'Star Wars Binary (German)', language: languageGerman, binary: true,
            mapName: 'germany',
            question: 'Was ist besser, Star Wars oder Star Trek?',
            post: expandDataList(post_starwars_german)
        },
    ],
    newInstanceParams: [
        {key: 'mapName', name: 'Map Name', type: 'select', options: [
            {key: 'usa', label: 'USA'},
            {key: 'canada', label: 'Canada'},
            {key: 'france', label: 'France'},
            {key: 'germany', label: 'Germany'},
        ]},
        {key: 'binary', name: 'Binary', type: 'boolean'},
        {key: 'question', name: 'Question', type: 'shorttext', placeholder: 'What question are people answering?'}
    ]
}

function getRegionMapAndNames(mapName, language) {
    switch (mapName) {
        case 'usa': return [squaremapUsa, squaremapNamesUsa];
        case 'canada': {
            if (language == languageFrench) {
                return [squaremapCanada, squaremapNamesCanadaFrench];
            } else {
                return [squaremapCanada, squaremapNamesCanada];
            }
        }
        case 'france': return [squaremapFrance, squaremapNamesFrance];
        case 'germany': return [squaremapGermany, squaremapNamesGermany];
        default: return [squaremapUsa, squaremapNamesUsa];
    }
}

function MissingPerspectivesScreen() {
    const posts = useCollection('post', {sortBy: 'time', reverse: true});
    const question = useGlobalProperty('question');
    const binary = useGlobalProperty('binary');
    const personaKey = usePersonaKey();
    const [selection, setSelection] = useState(null);
    const mapName = useGlobalProperty('mapName');
    const language = useLanguage();
    const [regions, regionNames] = getRegionMapAndNames(mapName, language);
    const hasAnswered = posts.some(post => post.from == personaKey);

    var shownPosts = posts;
    if (selection) {
        shownPosts = posts.filter(post => post.region == selection);
    }

    return <ScrollableScreen grey>
        <BigTitle>{question}</BigTitle>
        {hasAnswered ? 
            <QuietSystemMessage label='You have already written an opinion' />
        :
            <PostInput placeholder="What's your opinion?"  topWidgets={[EditRegion]} getCanPost={getCanPost}
            />
        }

        <Card>
            <SectionTitleLabel label='Filter by Region' />
            <Pad/>
            <SquareMap regions={regions} regionNames={regionNames} posts={posts} selection={selection} onChangeSelection={setSelection} binary={binary} />
        </Card>

        {selection ?
            <QuietSystemMessage label='Showing only posts from {regionName}' formatParams={{regionName: regionNames[selection]}} />
        :null}

        {shownPosts.map(post => 
            <Post key={post.key} post={post} actions={[PostActionLike, PostActionEdit]}
                editWidgets={[EditRegion]}
                topBling={<RegionBling region={post.region} regionNames={regionNames} />}
            />
        )}
    </ScrollableScreen>
}

function RegionBling({region, regionNames}) {
    return <Pill text={region + ': ' + (regionNames[region] ?? 'Unknown Region')} color='black' />
}

function getCanPost({datastore, post}) {
    return post.region && post.text;
}


function EditRegion({post, onPostChanged}) {
    const mapName = useGlobalProperty('mapName');
    const language = useLanguage();
    const [regions, regionNames] = getRegionMapAndNames(mapName, language);
    const regionItems = Object.keys(regionNames).map(key => ({key, label: key + ': ' + regionNames[key]}));
    const tSelect = useTranslation('Select your region');
    const unknown = {key: 'unknown', label: tSelect};

    return <PopupSelector value={post.region} items={[unknown, ...regionItems]} 
        onSelect={region => onPostChanged({...post, region})} /> 
}
