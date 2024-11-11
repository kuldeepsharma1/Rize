import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Parser from 'react-native-rss-parser';
import { Link } from 'expo-router';
import parseHTMLContent from '@/utils/parseHtml';

interface Rss {
  title: string;
  description?: string;
  language?: string;
  copyright?: string;
  lastBuildDate?: string;
  url: string;
  isDefault?: boolean; // New property to mark default feeds
}

export default function Index() {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [rssFeeds, setRssFeeds] = useState<Rss[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const defaultFeeds = [
    {
      url: 'https://feeds.buzzsprout.com/1882267.rss',
      isDefault: true,
    },
    {
      url: 'https://media.rss.com/theesportsreport/feed.xml',
      isDefault: true,
    },
  ];

  useEffect(() => {
    const loadRssFeeds = async () => {
      const storedFeeds = await AsyncStorage.getItem('rssFeeds');
      const parsedStoredFeeds: Rss[] = storedFeeds ? JSON.parse(storedFeeds) : [];

      // Fetch details for each default feed if not already stored
      const defaultFeedPromises = defaultFeeds.map((feed) => fetchRssFeed(feed.url, true));
      const defaultFeedResults = await Promise.all(defaultFeedPromises);

      const nonNullDefaultFeeds = defaultFeedResults.filter((feed) => feed !== null) as Rss[];

      // Combine default feeds with user-added feeds, avoiding duplicates
      const allFeeds = [...nonNullDefaultFeeds, ...parsedStoredFeeds].filter(
        (feed, index, self) => index === self.findIndex((f) => f.url === feed.url)
      );

      setRssFeeds(allFeeds);
      saveFeedsToStorage(allFeeds);
    };

    loadRssFeeds();
  }, []);

  const saveFeedsToStorage = async (feeds: Rss[]) => {
    await AsyncStorage.setItem('rssFeeds', JSON.stringify(feeds));
  };

  const fetchRssFeed = async (url: string, isDefault: boolean = false): Promise<Rss | null> => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!response.ok) throw new Error('Failed to fetch RSS');
      const rssText = await response.text();
      const feed = await Parser.parse(rssText);

      return {
        title: feed.title || 'No Title',
        description: feed.description || 'No Description',
        language: feed.language || 'Unknown',
        copyright: feed.copyright || 'No Copyright',
        lastBuildDate: feed.lastUpdated || 'No Date',
        url,
        isDefault, // Mark feed as default if it is one
      };
    } catch (err) {
      console.error('Error fetching RSS feed:', err);
      Alert.alert('Error', 'Failed to fetch RSS feed.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addRssFeed = async () => {
    if (!inputUrl) return;

    const newFeed = await fetchRssFeed(inputUrl);
    if (newFeed) {
      const updatedFeeds = [...rssFeeds, newFeed];
      setRssFeeds(updatedFeeds);
      saveFeedsToStorage(updatedFeeds);
      setInputUrl('');
    }
  };

  const removeRssFeed = async (url: string) => {
    const updatedFeeds = rssFeeds.filter((feed) => feed.url !== url || feed.isDefault);
    setRssFeeds(updatedFeeds);
    saveFeedsToStorage(updatedFeeds);
  };

  return (
    <View style={styles.container}>
      <Text className="mt-5" style={styles.title}>Podcast Feeds</Text>

      <View style={styles.urlInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter RSS Feed URL"
          value={inputUrl}
          onChangeText={setInputUrl}
        />
        <Pressable className='rounded-full bg-green-500  py-3 px-4 ml-4'  onPress={addRssFeed}>
          <Text style={{ color: '#fff' }}>Add Feed</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <FlatList
        data={rssFeeds}
        keyExtractor={(item) => item.url}
        renderItem={({ item }) => (
          <View style={styles.feedContainer}>
            <View style={styles.feedDetails}>
              <Text style={styles.rssTitle}>{item.title}</Text>
              <Text style={styles.rssDescription}>{parseHTMLContent(item.description || '')}</Text>
              <Text style={styles.rssLanguage}>Language: {item.language}</Text>
              <Text style={styles.rssDate}>Last Updated: {item.lastBuildDate}</Text>
            </View>
            <View style={styles.feedActions}>
              <Link
                href={{
                  pathname: '/podcast/view/[id]',
                  params: { url: encodeURIComponent(item.url) },
                }}
              >
                <Text style={styles.viewEpisodesLink}>View Episodes</Text>
              </Link>
              {/* Display "Remove" button only if the feed is not a default feed */}
              {!item.isDefault && (
                <Pressable onPress={() => removeRssFeed(item.url)} style={styles.removeButton}>
                  <Text style={{ color: '#fff' }}>Remove</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  urlInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
    alignSelf: 'center',
  },
  feedContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  feedDetails: {
    marginBottom: 10,
  },
  rssTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rssDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  rssLanguage: {
    fontSize: 12,
    marginBottom: 5,
  },
  rssDate: {
    fontSize: 12,
    marginBottom: 10,
  },
  feedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewEpisodesLink: {
    color: '#0066cc',
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    padding: 5,
    borderRadius: 3,
  },
});
