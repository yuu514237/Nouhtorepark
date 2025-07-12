-- Insert sample parent user
INSERT INTO users (id, email, name, role, avatar, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'parent@example.com', '田中太郎', 'parent', '👨', NOW());

-- Insert sample child users
INSERT INTO users (id, name, role, parent_id, avatar, age, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'たろう', 'child', '550e8400-e29b-41d4-a716-446655440000', '🦁', 7, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'はなこ', 'child', '550e8400-e29b-41d4-a716-446655440000', '🐱', 8, NOW());

-- Insert sample scores for たろう
INSERT INTO scores (user_id, game_type, score, time_taken, mistakes, played_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'number-touch', 850, 12500, 1, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 'number-touch', 720, 15200, 2, NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440001', 'memory-match', 680, 45000, 0, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 'logic-maze', 450, 120000, 3, NOW() - INTERVAL '3 days');

-- Insert sample scores for はなこ
INSERT INTO scores (user_id, game_type, score, time_taken, mistakes, played_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'number-touch', 920, 11800, 0, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 'memory-match', 850, 38000, 1, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 'sound-copy', 650, 25000, 2, NOW() - INTERVAL '2 days');

-- Insert sample badges
INSERT INTO badges (user_id, badge_name, badge_description, earned_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '初心者', '初めてゲームをクリア', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440001', '集中力マスター', '5回連続でミスなしクリア', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440001', 'スピードスター', '10秒以内でクリア', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446  'スピードスター', '10秒以内でクリア', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', '初心者', '初めてゲームをクリア', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440002', '記憶の達人', '絵合わせで満点獲得', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440002', '継続は力なり', '7日連続プレイ', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', '完璧主義者', 'ミス0回でクリア', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440002', 'チャレンジャー', '全ゲームをプレイ', NOW() - INTERVAL '4 days');

-- Insert sample play sessions
INSERT INTO play_sessions (user_id, started_at, ended_at, duration, games_played) VALUES
('550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes', 15, 3),
('550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes', 20, 4),
('550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '22 minutes', 22, 5),
('550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '18 minutes', 18, 3);

-- Insert user settings
INSERT INTO user_settings (user_id, daily_time_limit, play_schedule, notifications_enabled) VALUES
('550e8400-e29b-41d4-a716-446655440001', 30, 'after-school', true),
('550e8400-e29b-41d4-a716-446655440002', 45, 'anytime', true);
