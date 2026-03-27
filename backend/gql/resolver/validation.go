package resolver

import (
	"fmt"
	"regexp"
)

// validateTags validates that tags only contain alphanumeric characters and hyphens, and are max 20 chars
func validateTags(tags []string) error {
	tagPattern := regexp.MustCompile(`^[a-zA-Z0-9-]+$`)

	for _, tag := range tags {
		if len(tag) > 20 {
			return fmt.Errorf("tag '%s' exceeds maximum length of 20 characters", tag)
		}
		if !tagPattern.MatchString(tag) {
			return fmt.Errorf("tag '%s' contains invalid characters. Only alphanumeric characters and hyphens are allowed", tag)
		}
	}
	return nil
}
