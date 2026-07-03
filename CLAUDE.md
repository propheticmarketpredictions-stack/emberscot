# CLAUDE.md - Emberscot Multi-AI Workspace

## Project Context
This is a MERGED repository containing three integrated projects:
1. **Emberscot** - Coupon/deals marketplace (Base44)
2. **AI TeamView** - Split-screen multi-agent collaboration interface
3. **Digital Clone** - User behavior replication system

## Activation Commands
Use these to activate specific modes:

| Command | Mode |
|---------|------|
| `/splitscreen` | Enable multi-agent teamview |
| `/focus [project]` | Deep dive single project |
| `/clone on` | Activate digital twin |
| `/merge view` | See all project intersections |

## Multi-Agent Protocol
When in splitscreen mode:
- Address agents with @claude, @gemini, @copilot, etc.
- Use `#shared` for cross-agent context
- TeamView dashboard auto-updates with agent activity
- Digital clone maintains user preference layer

## Project Boundaries
```
emberscot/          <- Current repo (coupon marketplace)
├── ai-teamview/    <- Splitscreen agent interface
├── digital-clone/  <- User twin system
└── shared/         <- Common components & utils
```

## Critical Files
- `src/agents/AgentCoordinator.js` - Multi-agent orchestration
- `src/teamview/Dashboard.jsx` - Live team monitoring
- `src/clone/PreferenceEngine.js` - Digital twin core
- `shared/context/ProjectContext.js` - Cross-project state

## When Working...
- **On Emberscot**: Focus on coupon entities, business logic
- **On TeamView**: Consider agent communication protocols
- **On Clone**: Capture and replicate user patterns
- **On All**: Maintain shared context synchronization

See AGENTS.md for detailed agent configurations.
