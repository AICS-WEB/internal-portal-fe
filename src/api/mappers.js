export function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value || {}).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ""),
  );
}

export function asNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

export function listFrom(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

export function normalizeNotice(item = {}) {
  return {
    ...item,
    is_pinned: item.is_pinned ?? item.isPinned ?? false,
    views: item.views ?? item.view_count ?? item.viewCount ?? 0,
    view_count: item.view_count ?? item.viewCount ?? item.views ?? 0,
    author: item.author ?? item.author_name ?? item.authorName ?? "-",
    created_at: item.created_at ?? item.createdAt ?? "",
    attachments: item.attachments ?? [],
  };
}

export function normalizeNotification(item = {}) {
  return {
    ...item,
    read: item.read ?? item.is_read ?? item.isRead ?? false,
    created_at: item.created_at ?? item.createdAt ?? "",
  };
}

export function serializeNotice(values) {
  const attachments =
    values.attachmentFilename && values.attachmentStorageType
      ? [
          compactObject({
            filename: values.attachmentFilename,
            storageType: values.attachmentStorageType,
            fileUrl: values.attachmentFileUrl,
            filepath: values.attachmentFilepath,
            mimeType: values.attachmentMimeType,
            filesize: asNumber(values.attachmentFilesize),
          }),
        ]
      : undefined;

  return compactObject({
    title: values.title,
    content: values.content,
    category: values.category,
    isPinned: Boolean(values.isPinned),
    attachments,
  });
}

export function serializeCalendarEvent(values) {
  const participants = String(values.participantsText || "")
    .split(",")
    .map((item) => asNumber(item.trim()))
    .filter(Boolean);

  return compactObject({
    title: values.title,
    description: values.description,
    eventType: values.eventType,
    scope: values.scope,
    colorKey: values.colorKey,
    startDatetime: values.startDatetime,
    endDatetime: values.endDatetime,
    isAllDay: Boolean(values.isAllDay),
    location: values.location,
    isRecurring: Boolean(values.isRecurring),
    recurrenceRule: values.recurrenceRule,
    participants: participants.length ? participants : undefined,
  });
}

export function calendarToForm(item = {}) {
  return {
    title: item.title || "",
    description: item.description || "",
    eventType: item.event_type || item.eventType || "meeting",
    scope: item.scope || "shared",
    colorKey: item.color_key || item.colorKey || "",
    startDatetime: String(item.start_datetime || item.startDatetime || "").slice(0, 16),
    endDatetime: String(item.end_datetime || item.endDatetime || "").slice(0, 16),
    isAllDay: item.is_all_day ?? item.isAllDay ?? false,
    location: item.location || "",
    isRecurring: item.is_recurring ?? item.isRecurring ?? false,
    recurrenceRule: item.recurrence_rule || item.recurrenceRule || "",
    participantsText: Array.isArray(item.participants) ? item.participants.map((row) => row.user_id).join(",") : "",
  };
}

export function serializePublication(values) {
  const authors = String(values.authorsTextIds || "")
    .split(",")
    .map((item) => asNumber(item.trim()))
    .filter(Boolean);

  return compactObject({
    title: values.title,
    authorsText: values.authorsText,
    year: asNumber(values.year),
    publishedDate: values.publishedDate,
    pubType: values.pubType,
    status: values.status,
    venue: values.venue,
    doi: values.doi,
    isPublic: Boolean(values.isPublic),
    authors: authors.length ? authors : undefined,
  });
}

export function publicationToForm(item = {}) {
  return {
    title: item.title || "",
    authorsText: item.authors_text || item.authorsText || "",
    year: item.year || new Date().getFullYear(),
    publishedDate: String(item.published_date || item.publishedDate || "").slice(0, 10),
    pubType: item.pub_type || item.pubType || "intl_conf",
    status: item.status || "writing",
    venue: item.venue || "",
    doi: item.doi || "",
    isPublic: item.is_public ?? item.isPublic ?? false,
    authorsTextIds: Array.isArray(item.authors) ? item.authors.map((author) => author.user_id).join(",") : "",
  };
}

export function serializeFile(values) {
  return compactObject({
    title: values.title,
    description: values.description,
    category: values.category,
    minRole: values.minRole,
    filename: values.filename,
    mimeType: values.mimeType,
    fileUrl: values.fileUrl,
    filesize: asNumber(values.filesize),
  });
}

export function fileToForm(item = {}) {
  return {
    title: item.title || "",
    description: item.description || "",
    category: item.category || "template",
    minRole: item.min_role || item.minRole || "member",
    filename: item.filename || "",
    mimeType: item.mime_type || item.mimeType || "",
    fileUrl: item.file_url || item.fileUrl || "",
    filesize: item.filesize || "",
  };
}

export function serializeCredential(values) {
  return compactObject({
    title: values.title,
    category: values.category,
    username: values.username,
    password: values.password,
    url: values.url,
    memo: values.memo,
    minRole: values.minRole,
  });
}

export function credentialToForm(item = {}) {
  return {
    title: item.title || "",
    category: item.category || "other",
    username: item.username || "",
    password: "",
    url: item.url || "",
    memo: item.memo || "",
    minRole: item.min_role || item.minRole || "member",
  };
}
