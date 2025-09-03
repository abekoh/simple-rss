package tags

const (
	HNRSS = "hnrss"
)

// SpecialTags は特別な処理が必要なタグの一覧
var SpecialTags = map[string]bool{
	HNRSS: true,
}

// IsSpecialTag は指定されたタグが特別な処理を必要とするかを判定する
func IsSpecialTag(tag string) bool {
	return SpecialTags[tag]
}

// GetAllSpecialTags は特別なタグの一覧を取得する
func GetAllSpecialTags() []string {
	tags := make([]string, 0, len(SpecialTags))
	for tag := range SpecialTags {
		tags = append(tags, tag)
	}
	return tags
}
