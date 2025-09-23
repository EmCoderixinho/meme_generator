import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { extractConfigIdFromPath } from '../utils/configId';

export const useConfigRouting = () => {
    const navigate = useNavigate();
    const { configId: urlConfigId } = useParams<{ configId?: string }>();
    const [configId, setConfigId] = useState<string | null>(null);
    const [isNewConfig, setIsNewConfig] = useState(false);

    // Initialize config ID from URL params
    useEffect(() => {
        if (urlConfigId && extractConfigIdFromPath(urlConfigId)) {
            setConfigId(urlConfigId);
            setIsNewConfig(false);
        } else {
            // No config ID in URL - will be created when first config is saved
            setConfigId(null);
            setIsNewConfig(true);
        }
    }, [urlConfigId]);

    const updateConfigId = useCallback((newConfigId: string) => {
        setConfigId(newConfigId);
        setIsNewConfig(false);
        // Navigate to new config ID using React Router
        navigate(`/${newConfigId}`, { replace: true });
    }, [navigate]);

    return {
        configId,
        isNewConfig,
        updateConfigId,
    };
};
