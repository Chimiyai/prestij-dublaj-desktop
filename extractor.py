import os

def list_files(startpath):
    with open("folder_structure.txt", "w", encoding="utf-8") as f:
        for root, dirs, files in os.walk(startpath):
            level = root.replace(startpath, '').count(os.sep)
            indent = ' ' * 4 * (level)
            f.write(f'{indent}{os.path.basename(root)}/\n')
            subindent = ' ' * 4 * (level + 1)
            for file in files:
                f.write(f'{subindent}{file}\n')

if __name__ == '__main__':
    # Projenin ana dizininin tam yolunu buraya yazın
    # Örneğin: '/path/to/your/project' veya 'C:\\Users\\YourUser\\Projects\\MyProject'
    # Eğer betik zaten projenin ana dizinindeyse, '.' kullanabilirsiniz.
    project_path = '.'
    list_files(project_path)
    print("Klasör yapısı 'folder_structure.txt' dosyasına yazıldı.")