export default function compareTags(oldTag, newTag) {
	return oldTag.outerHTML === newTag.outerHTML;
};
