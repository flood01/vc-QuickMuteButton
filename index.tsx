import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin from "@utils/types";
import { findStoreLazy } from "@webpack";
import { FluxDispatcher, React } from "@webpack/common";

const MediaEngineStore = findStoreLazy("MediaEngineStore");
const UserStore = findStoreLazy("UserStore");

function isLocalMuted(userId: string): boolean {
    return MediaEngineStore.isLocalMute(userId);
}

function toggleLocalMute(userId: string) {
    FluxDispatcher.dispatch({
        type: "AUDIO_TOGGLE_LOCAL_MUTE",
        context: "default",
        userId
    });
}

function MuteIcon({ muted }: { muted: boolean; }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            {muted ? (
                <path
                    fill="currentColor"
                    d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23A6.94 6.94 0 0 0 19 11ZM4.27 3 3 4.27l6.01 6.01V11a3 3 0 0 0 3.91 2.86l1.51 1.51A4.98 4.98 0 0 1 7 11H5a7 7 0 0 0 6 6.92V21h2v-3.08c.83-.12 1.61-.4 2.31-.8L18.73 20 20 18.73 4.27 3ZM15 10.91V5a3 3 0 0 0-5.94-.6l5.87 5.87c.05-.1.07-.2.07-.31Z"
                />
            ) : (
                <path
                    fill="currentColor"
                    d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"
                />
            )}
        </svg>
    );
}

function LocalMuteButtonPlaceholder() {
    return (
        <div
            aria-hidden="true"
            style={{
                display: "inline-flex",
                order: -1,
                marginRight: 6,
                boxSizing: "border-box",
                width: 26,
                height: 26,
                padding: 3,
                border: "1px solid transparent"
            }}
        />
    );
}

function LocalMuteButton({ userId }: { userId: string; }) {
    const [muted, setMuted] = React.useState(() => isLocalMuted(userId));
    const color = muted
        ? "var(--status-danger, #f23f42)"
        : "var(--interactive-normal, #b5bac1)";

    return (
        <div
            role="button"
            aria-label={muted ? "Unmute locally" : "Mute locally"}
            title={muted ? "Unmute (local only)" : "Mute (local only)"}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                order: -1,
                marginRight: 6,
                boxSizing: "border-box",
                padding: 3,
                border: `1px solid ${color}`,
                borderRadius: 3,
                cursor: "pointer",
                color
            }}
            onClick={e => {
                e.stopPropagation();
                toggleLocalMute(userId);
                setMuted(m => !m);
            }}
        >
            <MuteIcon muted={muted} />
        </div>
    );
}

const LocalMuteButtonSafe = ErrorBoundary.wrap(LocalMuteButton, { noop: true });

export default definePlugin({
    name: "QuickLocalMute",
    description: "One-click local-mute icon next to each user connected to a voice channel.",
    authors: [{ name: "flood235", id: 1531845646842073301n }],

    patches: [
        {
            find: "\"VoiceUser\"",
            replacement: {
                match: /\(0,i\.jsx\)\(Q,\{disabled:A,\.\.\.N,isHovered:ea\}\)/,
                replace: "$&,$self.renderButton(et)"
            }
        }
    ],

    renderButton(user: { id: string; } | undefined) {
        if (!user) return null;
        if (user.id === UserStore.getCurrentUser()?.id) return <LocalMuteButtonPlaceholder />;
        return <LocalMuteButtonSafe userId={user.id} />;
    }
});
