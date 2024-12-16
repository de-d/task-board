import {useRef} from 'react';
import { Dropzone } from '@mantine/dropzone';
import classes from './DropzoneButton.module.css';
import Image from 'next/image'


interface DropzoneButtonProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    preview?: boolean;
}

export function DropzoneButton({ setFiles, files, preview = true }: DropzoneButtonProps) {
    const openRef = useRef<() => void>(null);

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'short' 
    };
    const formattedDate = date.toLocaleDateString('ru-RU', options);
    const year = date.getFullYear();


    return (
        <>
            <div className={classes.wrapper}>
                <Dropzone
                    openRef={openRef}
                    onDrop={handleDrop}
                    className={classes.dropzone}
                    radius="md"
                    accept={['image/jpeg', 'image/png', 'application/pdf', 'application/msword']}
                    maxSize={30 * 1024 ** 2}
                >
                    <div className={classes.dropContent} style={{pointerEvents: 'none', textAlign: 'center'}}
                         onClick={() => openRef.current?.()}>
                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M11.9496 7.87715L8.15607 11.7071C7.19614 12.6815 5.90254 12.5882 5.07608 11.7486C4.23934 10.909 4.14694 9.61334 5.11714 8.63382L10.3018 3.39934C10.8665 2.82925 11.7083 2.73078 12.2576 3.28532C12.8069 3.84505 12.7042 4.68982 12.1395 5.25473L7.05241 10.4011C6.82654 10.6343 6.55961 10.5669 6.39534 10.4115C6.24647 10.2508 6.18487 9.98131 6.41074 9.74809L9.95787 6.16687C10.1375 5.9803 10.1478 5.7108 9.97327 5.53459C9.79874 5.36875 9.5318 5.37393 9.35214 5.55532L5.78961 9.15208C5.23521 9.71181 5.25574 10.5669 5.74854 11.0645C6.28241 11.6035 7.08834 11.5879 7.64274 11.0282L12.7555 5.8611C13.7514 4.86085 13.7155 3.53927 12.8428 2.65822C11.9855 1.7979 10.656 1.73571 9.66014 2.74114L4.44468 8.0119C3.14594 9.32829 3.23321 11.2148 4.41901 12.412C5.59967 13.5988 7.47334 13.6921 8.77207 12.3809L12.5913 8.53016C12.7658 8.35395 12.7658 8.03263 12.5861 7.86678C12.4167 7.68021 12.1293 7.70612 11.9496 7.87715Z"
                                fill="#ABBED1"/>
                        </svg>
                        <span className={classes.dropText}>Выберите файлы или перетащите их сюда</span>
                    </div>
                </Dropzone>
            </div>

            {preview && (
                <div className={classes.previewContainer}>
                    {files.length > 0 && files.map((file, index) => (
                        <div key={index} className={classes.previewItem}>
                            {file.type.startsWith('image') ? (
                            <Image
                                src={URL.createObjectURL(file)}
                                alt={`preview-${index}`}
                                width={184}
                                height={88}
                                className={classes.previewImage}
                            />
                            ) : (
                                <div className={classes.filesImage}>
                                    <svg width="53" height="67" viewBox="0 0 53 67" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M10.057 67H42.943C49.5757 67 53 63.5062 53 56.8279V29.156H29.8626C26.0064 29.156 24.1554 27.3009 24.1554 23.4361V0H10.057C3.45518 0 0 3.49377 0 10.203V56.8279C0 63.5062 3.45518 67 10.057 67ZM30.4488 24.6419H52.6915C52.5064 23.2197 51.4884 21.8902 49.8842 20.2515L33.0093 3.12275C31.4668 1.54592 30.0786 0.494693 28.6595 0.309183V22.8486C28.6903 24.0545 29.2765 24.6419 30.4488 24.6419ZM14.5303 42.8528C13.2037 42.8528 12.2474 41.8943 12.2474 40.6576C12.2474 39.4209 13.2037 38.4624 14.5303 38.4624H38.5623C39.8271 38.4624 40.8143 39.4209 40.8143 40.6576C40.8143 41.8943 39.8271 42.8528 38.5623 42.8528H14.5303ZM14.5303 54.4472C13.2037 54.4472 12.2474 53.4887 12.2474 52.252C12.2474 51.0152 13.2037 50.0568 14.5303 50.0568H38.5623C39.8271 50.0568 40.8143 51.0152 40.8143 52.252C40.8143 53.4887 39.8271 54.4472 38.5623 54.4472H14.5303Z"
                                            fill="#F4F6F8"/>
                                    </svg>
                                </div>
                            )}
                            <div className={classes.ImageInfo}>
                                <a href={URL.createObjectURL(file)}>
                                    {file.name}
                                </a>
                                <span>{`${formattedDate} ${year}`}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}