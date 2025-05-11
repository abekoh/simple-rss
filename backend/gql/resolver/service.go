package resolver

import (
	"context"
	"fmt"
	"net/http"
	urlpkg "net/url"

	"github.com/PuerkitoBio/goquery"
)

func findFeedURL(ctx context.Context, url string) (string, error) {
	parsedURL, err := urlpkg.Parse(url)
	if err != nil {
		return "", fmt.Errorf("failed to parse url: %w", err)
	}
	(&http.Request{
		Method: "GET",
		URL:    parsedURL,
	}).WithContext(ctx)
	res, err := http.DefaultClient.Do(&http.Request{
		Method: "GET",
		URL:    parsedURL,
	})
	if err != nil {
		return "", fmt.Errorf("failed to fetch top page: %w", err)
	}
	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch top page: status code is not 200: %s", res.Status)
	}
	defer res.Body.Close()

	parsedHTML, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		// HTMLでなければそのまま返却
		return url, nil
	}
	if atomURL, ok := parsedHTML.Find("link[rel=alternate][type=application/atom+xml]").Attr("href"); ok {
		return atomURL, nil
	}
	if rssURL, ok := parsedHTML.Find("link[rel=alternate][type=application/rss+xml]").Attr("href"); ok {
		return rssURL, nil
	}
	return url, nil
}
