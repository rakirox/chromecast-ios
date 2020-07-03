/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  Button,
  Linking,
} from 'react-native';
import WebView from 'react-native-webview';
import GoogleCast, {CastButton} from 'react-native-google-cast';
import cheerio from 'react-native-cheerio';

const App: () => React$Node = () => {
  const [link, setLink] = useState(
    'https://simpsonizados.club/capitulo/los-simpson-30x3/',
  );
  const [currentLink, setCurrentLink] = useState(
    'https://simpsonizados.club/capitulo/los-simpson-30x3/',
  );
  const [webView, setWebView] = useState(null);
  const [adsBlock, setAdsBlock] = useState(0);
  // const webviewRef = useRef(null)
  useEffect(() => {
    // Connection established
    GoogleCast.EventEmitter.addListener(GoogleCast.SESSION_STARTED, () => {
      console.log('SESSION_STARTED');
    });
    return () => {
      GoogleCast.EventEmitter.removeAllListeners();
    };
  }, []);
  const jsCode = `
    const deepIframesVids = (doc, deep = 1) => {
      const iframes = [...doc.getElementsByTagName('iframe')];
      let iframesDocuments = [...iframes.map(iframe => iframe.contentDocument || iframe.contentWindow.document)];
      // c.postMessage(JSON.stringify(iframesDocuments));
      iframesDocuments = iframesDocuments.filter(iframe => Boolean(iframe));
      let videoTags = [];
      iframesDocuments.map(d => [...d.getElementsByTagName('video')]).filter(a => a.length > 0).forEach(a => videoTags.push(...a))
      const urls = [...videoTags.map(v => v.getElementsByTagName('source').map(s => s.src) )];
      // const urls = [...videoTags.map(v => v.src)];
      if (deep > 0) {
        iframesDocuments.forEach(d => {
          const nextDeep = deep - 1;
          urls.push(deepIframesVids(d, nextDeep));
        });
      }
      return urls; 
    }
    setInterval(() => {
      // console.log(JSON.stringify(document.getElementsByTagName('video')));
      const pageUrls = [...document.getElementsByTagName('video')].map(v => v.src);
      // const vidsInFrames = [...document.getElementsByTagName('iframe')].map(i => i.contentDocument).filter(i => Boolean(i)).map(d=>d.getElementsByTagName('video')).map(arrV => [...arrV]).map(vArr=>vArr.map(v => v.currentSrc))
      
      const urls = deepIframesVids(document, 3);
      // const raw = document.documentElement.innerHTML;
      // window.ReactNativeWebView.postMessage(urls);
      // window.ReactNativeWebView.postMessage(JSON.stringify({ urls, pageUrls }));
      
      window.ReactNativeWebView.postMessage([...pageUrls, ...urls]);
      // if(vids.length > 0) 
    },2000);
    true;
  `;

  const onMessage = ({nativeEvent}) => {
    console.log('got message');
    if (nativeEvent.data) {
      console.log(nativeEvent.data);

      // const $ = cheerio.load(nativeEvent.data);
      // const iframes = Object.values($('iframe'));
      // iframes.forEach(i => console.log(i));
      // console.log(
      //   ` this many iframes: ${iframes.length} typeof ${typeof iframes}`,
      //   iframes,
      // );
      // iframes.forEach(i => console.log($(i).document));
      // console.log(` this many videos: ${videos.length}`);
      // const iframesDocuments = [
      //   ...iframes.map(iframe => {
      //     console.log('mapping frames');
      //     console.log(JSON.stringify(iframe));
      //     console.log(iframe.contentDocument || iframe.contentWindow.document);
      //     return iframe.contentDocument || iframe.contentWindow.document;
      //   }),
      // ];
      // console.log('wkasd');
      // console.log(iframesDocuments.length);
      // console.log(iframesDocuments);

      // ].filter(iframe => Boolean(iframe));
      // iframesDocuments.map(d => [...d.getElementsByTagName('video')]).filter(a => a.length > 0).forEach(a => videoTags.push(...a))
    }
  };

  const castVid = () => {
    const mediaUrl =
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    GoogleCast.castMedia({
      mediaUrl,
      imageUrl:
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/images/480x270/BigBuckBunny.jpg',
    });
  };

  const onShouldStartLoadWithRequest = request => {
    if (/^(?:data:text|about:blank)/.test(request.url)) {
      setAdsBlock(adsBlock + 1);
      return false;
    }
    return true;
  };
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, seLoading] = useState(false);
  const webRef = useRef();
  const onNavigationStateChange = request => {
    setLink(request.url);
    setCanGoBack(request.canGoBack);
    setCanGoForward(request.canGoForward);
    seLoading(request.loading);
  };

  console.log(currentLink);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.fill}>
        <View style={styles.fill}>
          <View style={styles.searchBar}>
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="Type an Address"
              style={styles.textInput}
              autoCapitalize="none"
            />
            <Button
              // onPress={castVid}
              onPress={() => {
                console.log('fuck', link);
                setCurrentLink(link);
              }}
              title="Search"
            />
          </View>
          <View style={styles.castContainer}>
            <CastButton style={styles.castButton} />
            <Text>{`Popups blocked: ${adsBlock}`}</Text>
          </View>
          <WebView
            ref={webRef}
            originWhitelist={['*']}
            mixedContentMode="always"
            domStorageEnabled
            allowFileAccess
            allowUniversalAccessFromFileURLs
            allowsInlineMediaPlayback
            source={{uri: currentLink}}
            style={styles.webView}
            onMessage={onMessage}
            injectedJavaScript={jsCode}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onNavigationStateChange={onNavigationStateChange}
          />
          <View style={styles.castContainer}>
            <Button
              onPress={() => webRef.current.goBack()}
              title="<"
              disabled={!canGoBack}
            />
            <Button
              onPress={() => webRef.current.goForward()}
              title=">"
              disabled={!canGoForward}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  castContainer: {
    // backgroundColor: 'purple',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  castButton: {
    width: 50,
    height: 50,
  },
  searchBar: {
    flexDirection: 'row',
  },
  fill: {
    flexGrow: 1,
  },
  textInput: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#aaaaaa',
    padding: 10,
  },
  webView: {
    flexGrow: 1,
  },
});

export default App;
