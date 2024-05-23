import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';

const useLanguage = () => {
    const {i18n} = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('');

    useEffect(() => {
        // Проверяем куки для языка и устанавливаем его
        const langFromCookie = Cookies.get('i18nextLng');
        if (langFromCookie && langFromCookie !== i18n.language) {
            i18n.changeLanguage(langFromCookie);
            setCurrentLanguage(langFromCookie);
        } else {
            setCurrentLanguage(i18n.language);
        }
    }, []);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        Cookies.set('i18nextLng', lang, {expires: 365});
        setCurrentLanguage(lang);
    };

    return {currentLanguage, changeLanguage};
};

export default useLanguage;
