import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BigTitle, MiniTitle, Narrow, Pad, PillBox, Separator, SmallTitle, SmallTitleLabel } from "../component/basics"
import { ActionBar, BasicComments, CommentActionButton, CommentAuthorInfo, CommentContext, TopBlingBar } from "../component/comment";
import { authorZDFDigital } from "../data/authors";
import { useCollection, useData, useDatastore, useGlobalProperty, useObject, useSessionData } from "../util/datastore";
import { expandDataList, removeNullProperties } from "../util/util";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { gptProcessAsync } from "../component/chatgpt";
import { cancelculture, cancelcultureTopic, medicamentShortage, medicamentShortageTopic, oilvsacrylics, oilvsacrylics_topic, relationships, relationshipsTopic } from "../data/positions";
import { MediaLibraryPost } from "../contrib/zdf/medialibrary";

const description = `
This prototype shows a selection of comments from the comment section shown as position cards in a pinned box above.
The aim is to identify many as distinct as possible viewpoints the users might have on a certain debate or topic, so users can quickly preview all aspects.
With a quicker understanding of the topic, users might be more inclined to engage with others.

The cards are identified via AI.
Two approaches exist:

1. Directly identifying comments: The AI analyzes comments directly and makes a selection

2. Identifying positions, then assigning comments: The AI first analyzes the content of the topic and generates positions. Afterwards fitting comments are assigned.
`

const SHOWN_POSITIONS = 4
const COUNT_POSITIONS = 4;
const USEGPT = true;
const FAKEANALYSIS = false;
const CARD_HEIGHT = 300;
const CARD_WIDTH = 250;
const STRIPPING_LENGTH = 300;
const MAXCOMMENTSPERCATEGORY = 3;
const MAXCOMMENTS = 30;

const colorWarsMediaInfo = {
  primaryVideoTitle: "Exploring Acrylics vs. Oil Paint",
  videoSummary: "Exploring Acrylics vs. Oil Paint: Which is Ideal for Learning? Delve into the debate between Acrylic and Oil Paints! Discover the nuances, witness direct comparisons, and explore common objections.",
  videoLength: "10 min",
  videoDate: "02/18/2023",
  videoKey: "colorwars.jpg",
};

const medicamentShortageMediaInfo = {
  primaryVideoTitle: "Medication Shortage: Why are Antibiotics Scarce in Germany? | The Spur",
  videoSummary: "Germany grapples with shortages of essential medications, particularly antibiotics. Investigative reporters trace the trail of scarcity from hospitals and pharmacies to major pharmaceutical companies, extending to India, a key manufacturing hub. Challenges include disrupted supply chains, exacerbated during the COVID-19 pandemic. The report highlights consequences of Europe's reliance on Asian production, with insights from Hyderabad revealing environmental concerns. Can solutions be found to reclaim medication production to Europe?",
  videoLength: "10 min",
  videoDate: "02/18/2023",
  videoKey: "medicamentshortage.jpg",
};

const relationshipsMediaInfo = {
  primaryVideoTitle: "Love, Family, Friendship: Should I Save My Relationship? | Should I...? on 37 Degrees",
  videoSummary: "Ending a relationship is never easy. Four individuals are faced with the question of whether it's better to stay and fight or to make a painful break. ",
  videoLength: "10 min",
  videoDate: "02/18/2023",
  videoKey: "relationships.jpg",
};

const cancelCultureMediaInfo = {
  primaryVideoTitle: "Sarah Bosetti wants to talk... about speech bans and cancel culture",
  videoSummary: "Sarah Bosetti will talk... about speech bans and cancel culture. Gottschalk is leaving because he can't talk on TV like at home anymore, and Sarah Bosetti finds this a good reason to talk about speech bans and cancel culture.",
  videoLength: "10 min",
  videoDate: "02/18/2023",
  videoKey: "cancelculture.jpg",
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ScrollViewContext = createContext();

export const PositionCardsPrototype = {
    key: 'positioncards',
    name: 'Position Cards',
    author: authorZDFDigital,
    date: '2024-01-04',
    description,
    screen: ArticleWithPositionCards,
    instance: [
        {key: 'medicamentShortage', topic: medicamentShortageTopic, name: 'Medicament shortage - Die Spur', comment: expandDataList(medicamentShortage), mediaInfo: medicamentShortageMediaInfo},
        {key: 'relationships', topic: relationshipsTopic, name: 'Love, Family, Friendship: Should I Save My Relationship? | Should I...? on 37 Degrees', comment: expandDataList(relationships), mediaInfo: relationshipsMediaInfo},
        {key: 'cancelculture', topic: cancelcultureTopic, name: 'Sarah Bosetti wants to talk... about speech bans and cancel culture', comment: expandDataList(cancelculture), mediaInfo: cancelCultureMediaInfo},
        {key: 'colorwars', topic: oilvsacrylics_topic, name: 'Oil vs Acrylic Paint', comment: expandDataList(oilvsacrylics), mediaInfo: colorWarsMediaInfo},
    ]
}

function ScrollToMeComponent({commentKey}) {

  const comment = useObject('comment', commentKey);
  const datastore = useDatastore();

  const scrollView = useContext(ScrollViewContext);
  const ref = useRef(null);

  const scrollToComment = useSessionData(['comment', commentKey, 'scrollTo']);
  useEffect(()=>{
      if(scrollToComment){
          datastore.setSessionData(['comment', commentKey, 'scrollTo'], false);
          datastore.setSessionData(['replyToComment'], commentKey);
          const rect = ref.current.getBoundingClientRect();
          if (scrollView.current) {
              scrollView.current.scrollTo({ y: rect.top, animated: true});
            }
      }
  },[scrollToComment])

  
  return <View ref={ref}></View>
}

export function ArticleWithPositionCards() {
    const articleKey = useGlobalProperty('articleKey');
    const dataTree = useData();
    console.log(dataTree)

    const ref = useRef();
    const commentsRef = useRef();

    const datastore = useDatastore();

    const scrollTo = useGlobalProperty("scrollToInput");
    useEffect(()=>{
        if(scrollTo){
            datastore.setGlobalProperty("scrollToInput", false)
            if (ref.current) {
                const top = commentsRef.current.getBoundingClientRect().top;
                ref.current.scrollTo({ y: top, animated: true});
              }
        }
    },[scrollTo])

    const commentContext = useContext(CommentContext);
    const commentConfig = {...commentContext, 
      topBling: [ScrollToMeComponent]
    }

    const mediaInfo = useGlobalProperty("mediaInfo")



    return <ScrollViewContext.Provider value={ref}>
        <ScrollView ref={ref} contentContainerStyle={{justifyContent: "center", alignItems: "center"}}>
            <MediaLibraryPost
            primaryVideoTitle={mediaInfo.primaryVideoTitle}
            videoSummary={mediaInfo.videoSummary}
            videoLength={mediaInfo.videoLength}
            videoDate={mediaInfo.videoDate}
            videoKey={mediaInfo.videoKey}
        />
        
            <PositionCards cardContainer={PositionCardsSlideShow} analysisFunction={GetPositionsApproach1} refreshFunction={GetPositionsApproach1}></PositionCards>
            <Separator />
            <View ref={commentsRef}></View>
            <Narrow>
                <SmallTitleLabel label='Comments'/>
                <BasicComments config={commentConfig}/>
                <Pad size={32} />
            </Narrow>
        </ScrollView>
    </ScrollViewContext.Provider>
}

function JumpToComment({ commentKey, comment }) {
  const datastore = useDatastore();
  return (
    <CommentActionButton
      key="report"
      label={"Jump to Discussion"}
      onPress={() => {
        datastore.setSessionData(["comment", commentKey, "scrollTo"], true);
      }}
    />
  );
}

export function PositionCardsSlideShow() {
  const defaultConfig = useContext(CommentContext);
  const newConfig = {
    ...defaultConfig,
    ...removeNullProperties({ actions: [JumpToComment] }),
  };

  let posComments = useGlobalProperty("positionComments");

  return (
    <CommentContext.Provider value={newConfig}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={PositionCardsStyle.scroll_container}
        centerContent={true}
      >
        {posComments.slice(0, SHOWN_POSITIONS).map((comment) => (
          <PositionCardComment
            key={comment.key}
            commentKey={comment.key}
            showPosition={true}
          />
        ))}
        <MissingOpinionCard text="Is your perspective not represented?"></MissingOpinionCard>
      </ScrollView>
    </CommentContext.Provider>
  );
}

export function MissingOpinionCard({text = "Is your perspective not represented?", innerText, headerTextAlign="center"}) {
  const datastore = useDatastore()
  return <View style={[CommentStyle.cardContainer, {flexDirection: "column", justifyContent: "center", alignItems: "center"}]}>
    <View style={[CommentStyle.cardHeader, {backgroundColor: "lightgray"}]}>
      <Text style={{textAlign: headerTextAlign, fontSize: 14, fontWeight: 'bold'}}>{text}</Text>
    </View>
<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text style={{textAlign: "center", fontSize: 14, fontWeight: 'bold'}}>{innerText}</Text>
        <Button title="Add a comment" onPress={()=>datastore.setGlobalProperty("scrollToInput", true)}></Button>
      </View>
    </View>  
  </View>
}

export function PositionCardCategorySlideShow(){
  const datastore = useDatastore();

  let posComments = useGlobalProperty("positionComments");
  let posCategories = useGlobalProperty("categories");

  console.log(posCategories)

  const defaultConfig = useContext(CommentContext);
  const newConfig = {
    ...defaultConfig,
    ...removeNullProperties({ actions: [JumpToComment] }),
  };


  posCategories.forEach(category => {
    category.comments = posComments.filter((c) => c.category == category.id)
    category.length = category.comments.length
  });
  const max = posCategories.reduce((prev, current) => {return (prev && prev.length > current.length) ? prev : current}, 0).length
  const ratio = max == 0 ? 1 : MAXCOMMENTSPERCATEGORY/max;
  posCategories.map(value => value.comments = value.comments.slice(0, Math.min(Math.ceil(ratio * value.comments.length)), value.comments.length))

  var emptyCategoryExists = false
  posCategories.map(category => {if(category.comments.length === 0)emptyCategoryExists=true})
  posCategories = posCategories.slice(0, SHOWN_POSITIONS)


  return (
    <CommentContext.Provider value={newConfig}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      contentContainerStyle={PositionCardsStyle.scroll_container}
    >
      {posCategories.map((category) => (
        <View key={category.id} style={{}}>
          {category.comments.length > 0? 
          <StackedCards category={category}></StackedCards> : 
        <MissingOpinionCard text={category.position} innerText={"This perspective is not represented"} headerTextAlign="auto"></MissingOpinionCard>}

        </View>
      ))}
        {!emptyCategoryExists ? <MissingOpinionCard ></MissingOpinionCard> : <></>}
      
    </ScrollView>
    </CommentContext.Provider>
  );
}

function StackedCards({category}){

  if(category.comments.length == undefined || category.comments.length <= 0){
    return <></>
  }

  return <PositionCardComment
          key={category.comments[0].key}
          commentKey={category.comments[0].key}
          showPosition={true}
          positionText={category.position}
          customColor={category.color}
    />
  
}



export function PositionCards() {
  const datastore = useDatastore();
  const comments = useCollection("comment", { sortBy: "time", reverse: false });
  const [selectedGptMode, setSelectedGptMode] = useState(0);
  let analysisMode = useGlobalProperty("gptMode");

  useEffect(()=>{
    datastore.setGlobalProperty("gptMode", 0)
  },[])

  function changeGptMode(event){
    setSelectedGptMode(event.target.value)
  }
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  async function analyzeComments(){
    setLoading(true)
    setAnalyzed(false)
    await analysisLookup[selectedGptMode](datastore, comments)
    datastore.setGlobalProperty("gptMode", selectedGptMode)
    setLoading(false)
    setAnalyzed(true)
  }

  return (
    <View style={PositionCardsStyle.outer_container}>

      <View style={{width:"100%", flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, alignItems:"center"}}>
      {!loading ?<View style={{flexDirection: "row"}}>
        <SmallTitle>Select Analysis Strategy: </SmallTitle><select name="cars" id="cars" value={selectedGptMode} onChange={changeGptMode}>
        <option value="0">Approach 1: Analyze comments directly</option>
        <option value="1">Approach 2: Identify categories, then assign comments</option>
      </select></View>
       : <></>}
       {analyzed ? (<TouchableOpacity
          onPress={analyzeComments}
          style={{ paddingHorizontal: 16, zIndex: 10}}
        >
          <PillBox>
            <Text style={{ fontSize: 24 , paddingRight: 8}}>🔎</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>New Analysis</Text>
          </PillBox>
        </TouchableOpacity>) : <></>}
      </View>

      <View style={PositionCardsStyle.header_container}>
        <BigTitle>
          {analyzed
            ? "Take a look on what people say about the topic:"
            : "Analyze the comment section"}{" "}
        </BigTitle>
      </View>
      <View style={PositionCardsStyle.inner_container}>
        {analyzed &&
        !loading ?<>
          {analysisMode == 0 ? <PositionCardsSlideShow></PositionCardsSlideShow> : <></>}
          {analysisMode == 1 ? <PositionCardCategorySlideShow></PositionCardCategorySlideShow> : <></>}
        </>      
         : (
          <>
            {!loading ? (
              <Button
                title="Analyze"
                onPress={() => analyzeComments()}
              ></Button>
            ) : (
              <ActivityIndicator></ActivityIndicator>
            )}
          </>
        )}
      </View>
      { analyzed &&
      !loading ? (
        <Text>⚠️ Selections are made by an AI</Text>
      ) : (
        <></>
      )}
    </View>
  );
}

export function PositionCardComment({commentKey, showPosition = true, showPositionColor = false, positionText, customColor}) {
    const s = CommentStyle;
    const comment = useObject('comment', commentKey);
    const {actions, authorFace} = React.useContext(CommentContext);

    if(!positionText && comment.position){
      positionText = comment.position
    }

    return (
      <View style={s.cardContainer}>
        {showPosition? 
        <View
          style={[
            s.cardHeader,
            !showPositionColor ? {backgroundColor:"lightgray"} : {},
            !positionText ? {height: 8}: {},
            customColor ? {backgroundColor: customColor} : {}
          ]}
        >
          {positionText ? (
            <MiniTitle>{positionText}</MiniTitle>
          ) : (
            <Text></Text>
          )}

        </View>:
        <></>}
        
        <View style={s.commentHolder}>
          <View style={s.commentLeft}>
            {React.createElement(authorFace, { comment })}
          </View>
          <View style={s.commentRight}>
            <View style={s.commentBox}>
              <CommentAuthorInfo commentKey={commentKey} />
              <TopBlingBar commentKey={commentKey} comment={comment} />
              <ScrollView style={{ flex: 1 }}>
                <Text style={s.text}>{comment?.text}</Text>
              </ScrollView>
              <ActionBar
                actions={actions}
                commentKey={commentKey}
                comment={comment}
              />
            </View>
          </View>
        </View>
      </View>
    );
}

const CommentStyle = StyleSheet.create({
    cardContainer: {
      height: CARD_HEIGHT,
      width: CARD_WIDTH,
      borderWidth: 2,
      borderRadius: 8,
      borderColor: "gray",
      shadowColor: "black",
      shadowOffset: {width: 8,height: 8},
      shadowOpacity: 0.8,
      backgroundColor: "white",
      opacity: 1
  },
    commentHolder: {
        flexDirection: 'row',
        flex: 1,
        padding: 4
    },
    text: {
        fontSize: 15,
        color: '#333',
        maxWidth: 300
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
    },
    cardHeader: {
        borderTopEndRadius: 8,
        borderTopStartRadius: 8,
        marginBottom: 8,
        paddingTop: 4,
        paddingHorizontal:8,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between"
    }
})


const PositionCardsStyle = StyleSheet.create({
    outer_container: {
        flexDirection: 'column',
        borderColor: "gray",
        borderWidth: 2,
        borderRadius: 8,
        maxWidth: 1400,
        padding: 8,
        marginBottom: 16

    },
    header_container: {
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center"
    },
    inner_container: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    scroll_container: {
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 20,
        padding: 10,
        overflow: "hidden"
    }
})

const analysisLookup = [
  GetPositionsApproach1,
  GetPositionsApproach2
]


async function GetPositionsApproach2(datastore, comments, useComments = false) {
  const topic = datastore.getData()["topic"]
  if(!USEGPT || FAKEANALYSIS){
    await delay(1000);
    const categories = [{position: "Category 1",id: 0},{position: "Category 2",id: 1},{position: "Category 3",id: 2}]
    datastore.setGlobalProperty("categories", categories)
    const newPositions = [];
    comments.forEach(comment => {
      const rand = Math.floor(Math.random() * 2)
      datastore.modifyObject("comment", comment.key, c =>({
        ...c,
        category: rand,
    }))
    comment.category = rand
    newPositions.push(comment)
    })
    datastore.setGlobalProperty("positionComments", newPositions)
    return
  }

  const strippedComments = comments.slice(0, MAXCOMMENTS).map(({ key, text }) => ({ key, text })).filter(c => c.text.length < STRIPPING_LENGTH);
  var analysis = await gptProcessAsync({
    datastore,
    promptKey: "positionCards_cluster_1",
    params: {
      TOPIC: topic,
      COUNT: COUNT_POSITIONS,
      COMMENTS: useComments ? "Here are comments made by the users: " + JSON.stringify(strippedComments) : ""
    },
  });
  console.log(analysis)

  const analysis_comments = await gptProcessAsync({
    datastore,
    promptKey: "positionCards_cluster_2",
    params: {
      TOPIC: topic,
      CATEGORIES: JSON.stringify(analysis),
      COMMENTS: JSON.stringify(strippedComments)
    },
  });

  const newPositions = [];
  analysis_comments.forEach((element) => {
    const key = element.comment_key;
    comments.forEach((comment) => {
      if (key == comment.key) {
          datastore.modifyObject("comment", comment.key, c =>({
              ...c,
              category: element.id
          }))
          comment.category = element.id
        newPositions.push(comment);
      }
    });
  });

  datastore.setGlobalProperty("categories", analysis)
  datastore.setGlobalProperty("positionComments", newPositions)
}

async function GetPositionsApproach1(datastore, comments) {
  if(!USEGPT || FAKEANALYSIS){
    await delay (1000);
    const slicedComments = comments.slice(0,COUNT_POSITIONS);
    slicedComments.map(comment => {
      console.log(comment.key)
      datastore.modifyObject("comment", comment.key, c =>({
        ...c,
        position: "Placeholder Position",
      }))
    })
    datastore.setGlobalProperty("positionComments", slicedComments)
    return;
  }
  //Analyze Comment by gpt
  const strippedComments = comments.slice(0, MAXCOMMENTS).map(({ key, text }) => ({ key, text })).filter(c => c.text.length < STRIPPING_LENGTH);
  const topic = datastore.getData()["topic"]
  const analysis = await gptProcessAsync({
    datastore,
    promptKey: "positioncards",
    params: {
      COMMENTS: JSON.stringify(strippedComments),
      TOPIC: topic ? "Here is the description of the article: " + topic : "",
      COUNT: COUNT_POSITIONS
    },
  });
  const newPositions = [];
  analysis.forEach((element) => {
    const key = element.comment_key;
    comments.forEach((comment) => {
      if (key == comment.key) {
          datastore.modifyObject("comment", comment.key, c =>({
              ...c,
              position: element.title,
              explanation: element.explanation
          }))
        newPositions.push(comment);
      }
    });
  });
  datastore.setGlobalProperty("positionComments", newPositions)
}