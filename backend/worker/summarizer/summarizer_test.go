package summarizer

import "testing"

func TestGetCommentLinkFromHNRSS(t *testing.T) {
	desc := `<p><a href="https://facebook.com/story.php?story_fbid=10238073579963378&id=1378467145" rel="nofollow">https://facebook.com/story.php?story_fbid=10238073579963378&...</a></p><hr><p>Comments URL: <a href="https://news.ycombinator.com/item?id=44210606">https://news.ycombinator.com/item?id=44210606</a></p><p>Points: 583</p><p># Comments: 121</p>`
	link, err := getCommentLinkFromHNRSS(desc)
	if err != nil {
		t.Fatal(err)
	}
	expected := "https://news.ycombinator.com/item?id=44210606"
	if link != expected {
		t.Errorf("expected %s, but got %s", expected, link)
	}
}
