-- Custom SQL migration file, put your code below! --
-- Sync insert and update triggers for auth.users to public.account
CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  default_username text;
  base_username    text;
  counter          int := 0;
BEGIN
  base_username := split_part(NEW.email, '@', 1);

  default_username := base_username;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.account WHERE username = default_username
    );
    counter := counter + 1;
    default_username := base_username || counter;  -- "minombre1", "minombre2"
  END LOOP;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.account (
      id, email, username, name, created_at, updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      default_username,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        default_username
      ),
      NEW.created_at,
      now()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.account
    SET
      email      = NEW.email,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- User creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user();

-- User update trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user();

-- Handle hard delete of user in auth.users
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.account
    WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- User delete trigger
DROP TRIGGER IF EXISTS on_auth_user_delete ON auth.users;
CREATE TRIGGER on_auth_user_delete
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_delete_user();

-- Handle hard delete of user in  public.account
CREATE OR REPLACE FUNCTION public.handle_account_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM auth.users
    WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- User delete trigger
DROP TRIGGER IF EXISTS on_account_delete ON public.account;
CREATE TRIGGER on_account_delete
  AFTER DELETE ON public.account
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_account_delete();