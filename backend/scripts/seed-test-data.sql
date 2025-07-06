-- Insert test feeds
INSERT INTO feeds (feed_id, title, url, created_at) VALUES 
('test-feed-1', 'Test Tech Blog', 'https://example.com/tech/feed.xml', NOW()),
('test-feed-2', 'Test News Site', 'https://example.com/news/feed.xml', NOW());

-- Insert test posts
INSERT INTO posts (post_id, feed_id, title, url, posted_at, created_at) VALUES 
('test-post-1', 'test-feed-1', 'Introduction to GraphQL', 'https://example.com/tech/graphql-intro', NOW() - INTERVAL '1 hour', NOW()),
('test-post-2', 'test-feed-1', 'Building React Apps', 'https://example.com/tech/react-apps', NOW() - INTERVAL '2 hours', NOW()),
('test-post-3', 'test-feed-2', 'Tech News Update', 'https://example.com/news/tech-update', NOW() - INTERVAL '30 minutes', NOW()),
('test-post-4', 'test-feed-2', 'Industry Trends 2025', 'https://example.com/news/trends-2025', NOW() - INTERVAL '3 hours', NOW()),
('test-post-5', 'test-feed-1', 'Advanced TypeScript', 'https://example.com/tech/typescript-advanced', NOW() - INTERVAL '4 hours', NOW());