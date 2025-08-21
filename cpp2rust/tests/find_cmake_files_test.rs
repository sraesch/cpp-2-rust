#[cfg(test)]
mod test {
    use std::path::Path;

    use cpp2rust::cpp::find_cmake_list_files;

    #[test]
    fn test_finding_cmake_files() {
        let root_folder = Path::new("test_data/finding_cmake_lists");
        let result = find_cmake_list_files(root_folder);
        assert!(result.is_ok());
        let folder = result.unwrap();
        assert_eq!(folder.name, "finding_cmake_lists");
        assert_eq!(folder.sub_folders.len(), 2);

        assert!(folder.has_cmake_lists);
        assert_eq!(folder.sub_folders[0].name, "a");
        assert!(folder.sub_folders[0].has_cmake_lists);
        assert_eq!(folder.sub_folders[1].name, "c");
        assert!(!folder.sub_folders[1].has_cmake_lists);

        assert_eq!(folder.sub_folders[1].sub_folders.len(), 1);
        assert_eq!(folder.sub_folders[1].sub_folders[0].name, "d");
        assert!(folder.sub_folders[1].sub_folders[0].has_cmake_lists);
        assert!(folder.sub_folders[1].sub_folders[0].sub_folders.is_empty());
    }
}